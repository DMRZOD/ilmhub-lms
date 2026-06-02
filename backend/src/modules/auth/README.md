# Auth module

Step 10 of `IMPLEMENTATION_ROADMAP.md`. Implements email/password auth with JWT
access tokens, rotating refresh tokens, email verification, and password reset.

Google OAuth is intentionally **not** here — see Step 11.

## Endpoints

| Method | Path                       | Auth     | Body / Query                                    | Returns                                |
| ------ | -------------------------- | -------- | ----------------------------------------------- | -------------------------------------- |
| POST   | `/auth/register`           | public   | `{ email, password, name, role }`               | `{ accessToken, refreshToken, user }`  |
| POST   | `/auth/login`              | public   | `{ email, password }`                           | `{ accessToken, refreshToken, user }`  |
| POST   | `/auth/refresh`            | public   | `{ refreshToken }`                              | `{ accessToken, refreshToken }`        |
| POST   | `/auth/logout`             | public   | `{ refreshToken }`                              | `{ ok: true }`                         |
| POST   | `/auth/forgot-password`    | public   | `{ email }`                                     | `{ ok: true }` (always)                |
| POST   | `/auth/reset-password`     | public   | `{ token, newPassword }`                        | `{ ok: true }`                         |
| GET    | `/auth/verify-email`       | public   | `?token=...`                                    | `{ ok: true }`                         |
| POST   | `/auth/resend-verification`| public   | `{ email }`                                     | `{ ok: true }`                         |
| GET    | `/auth/me`                 | required | —                                               | the current `User` (without password)  |

`role` in `/auth/register` is restricted to `STUDENT | INSTRUCTOR` via DTO
validation. Promoting to `ADMIN` is an out-of-band operation (DB seed / admin
panel — Step 13+).

## Token flow

```
register ─────────┐
                  ▼                       ┌──────► /auth/me  (Bearer access)
                login  ──► access (15m) ──┤
                  │     ──► refresh (7d) ─┴──► /auth/refresh ─► new pair
                  │                                 │   (old → revokedAt=now)
                  ▼                                 │
            /auth/logout ◄────────────────────────┘
       (revokes the refresh token)
```

### Reuse detection

`RefreshToken.hashedToken` is `sha256(full JWT)`. If `/auth/refresh` receives a
token whose stored row already has `revokedAt`, every refresh token belonging
to that user is revoked (mitigates stolen token reuse).

### Email verification

`POST /auth/register` always creates an `EmailVerificationToken` (24h TTL) and
calls `EmailService.sendVerificationEmail`. If `RESEND_API_KEY` is unset the
service logs the full URL to Pino at `info` level — the registration response
still succeeds. The user receives email + clicks
`${FRONTEND_URL}/auth/verify-email?token=...`, frontend forwards to backend,
backend sets `User.emailVerified=true`.

### Password reset

`POST /auth/forgot-password` is silent on missing emails (returns `ok: true`
either way) to avoid leaking account existence. On success it creates a
`PasswordResetToken` (24h, single-use). `POST /auth/reset-password` swaps
`passwordHash`, marks the token `usedAt=now`, and revokes every refresh token
for that user in one transaction (force-logout all sessions).

## Using auth in other modules

Global `JwtAuthGuard` is registered in `AppModule`. Every route is **protected
by default**. Opt out with `@Public()`:

```ts
import { Public } from 'src/common/decorators/public.decorator';

@Public()
@Get('something-anonymous')
publicEndpoint() { ... }
```

Read the current user with `@CurrentUser()`:

```ts
import {
  CurrentUser,
  type AuthenticatedUser,
} from 'src/common/decorators/current-user.decorator';

@Get('profile')
profile(@CurrentUser() user: AuthenticatedUser) {
  return user;
}
```

## Env vars

| Name                 | Required | Notes                                                  |
| -------------------- | -------- | ------------------------------------------------------ |
| `JWT_SECRET`         | yes      | min 16 chars; signs access tokens                      |
| `JWT_REFRESH_SECRET` | yes      | min 16 chars; signs refresh tokens                     |
| `FRONTEND_URL`       | yes      | base for verification + reset email links              |
| `RESEND_API_KEY`     | no       | if empty, emails are logged instead of sent            |
| `EMAIL_FROM`         | no       | default `IlmHub <noreply@ilmhub.uz>`                   |
| `TEST_DATABASE_URL`  | no       | enables `pnpm test:e2e` (otherwise specs are skipped)  |

## Rate limiting

`/auth/login` and `/auth/register` have a per-IP cap of **5 req/min** via the
`auth` `@Throttle` config wired in `AppModule`. All other routes inherit the
global default (10 req/sec).

## Token lifetimes

- Access JWT: **15 min** (`expiresIn: '15m'`).
- Refresh JWT: **7 days**.
- Email verification token: **24h**.
- Password reset token: **24h**, single-use.

Passwords are hashed with **bcrypt, 12 rounds**.

## What's NOT in this step

- Google OAuth & `passport-google-oauth20` — Step 11.
- Frontend integration that calls these endpoints — Step 11.
- `@Roles()` decorator / `RolesGuard` — added when admin-only routes appear
  (Step 13+).
- Session cookies / CSRF — tokens are Bearer-only.
- 2FA / OTP / magic links — out of roadmap.
