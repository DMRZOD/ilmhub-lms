# IlmHub Backend

NestJS + Prisma + Supabase PostgreSQL API server for [IlmHub.uz](https://ilmhub.uz).

This is the **initial skeleton** (roadmap Step 3). It boots, exposes `GET /health` (which pings the database), and has every cross-cutting concern wired up (validation, Prisma exception filter, Pino logger, CORS, Helmet, Throttler). The auth, courses, payments and other domain modules are added in later roadmap steps.

## Requirements

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- A **Supabase** PostgreSQL project (free plan is fine)

## Setup

### 1. Create a Supabase project

1. Go to https://supabase.com and create a new project.
2. Wait for the database to provision (~1 minute).
3. Open **Project Settings → Database → Connection string**.
4. Copy two URLs:
   - **Transaction pooler** (port `6543`) → goes into `DATABASE_URL`. This is used at runtime by `@prisma/client` and is friendly to serverless / connection-pooled environments.
   - **Session/Direct** (port `5432`) → goes into `DIRECT_URL`. This is used by `prisma migrate dev` because migrations require a direct (non-pooled) connection.
5. Replace the placeholder password (`[YOUR-PASSWORD]`) with the database password you chose when creating the project.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

- `DATABASE_URL` — pooled Supabase connection string (port 6543)
- `DIRECT_URL` — direct Supabase connection string (port 5432)
- `JWT_SECRET` — random ≥ 16 char string (`openssl rand -base64 32`)
- `JWT_REFRESH_SECRET` — another random ≥ 16 char string

The other variables (`GOOGLE_*`, `RESEND_API_KEY`, `MUX_*`, `PAYME_*`) are optional placeholders that will be filled in during later roadmap steps.

### 3. Install dependencies

```bash
pnpm install
```

### 4. Generate the Prisma client and run the initial migration

```bash
pnpm prisma:generate
pnpm prisma:migrate --name init
```

The migration creates the `User` table in your Supabase database. You can verify in the Supabase Dashboard → Table Editor.

### 5. Start the dev server

```bash
pnpm start:dev
```

The server starts on **http://localhost:3001** with file watching.

### 6. Verify

```bash
curl http://localhost:3001/health
# → {"ok":true,"db":"connected"}
```

If the database is unreachable, the endpoint returns HTTP 503 with `{"ok":false,"db":"disconnected"}`.

## Scripts

| Command                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `pnpm start:dev`       | Run NestJS in watch mode (auto-restart on file changes)  |
| `pnpm start`           | Run NestJS once (no watch)                               |
| `pnpm build`           | Compile TypeScript to `dist/`                            |
| `pnpm start:prod`      | Run the compiled `dist/main.js`                          |
| `pnpm prisma:generate` | Regenerate `@prisma/client` after schema changes         |
| `pnpm prisma:migrate`  | Create + apply a new migration (dev only)                |
| `pnpm prisma:deploy`   | Apply pending migrations (production)                    |
| `pnpm prisma:studio`   | Open Prisma Studio (GUI for inspecting the DB)           |
| `pnpm prisma:reset`    | Drop the DB schema and re-apply all migrations (dev)     |

## Project layout

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema (only User for now; full schema in Step 13)
├── src/
│   ├── main.ts                # Bootstrap: Helmet, CORS, Pino, listen :3001
│   ├── app.module.ts          # Root module: Config, Logger, Throttler, Prisma, Health
│   ├── config/
│   │   ├── env.schema.ts      # zod schema for environment variables
│   │   └── validate-env.ts    # ConfigModule validator
│   ├── common/
│   │   ├── filters/           # Global exception filters (Prisma → HTTP, fallback)
│   │   ├── guards/            # (added in later steps: JwtAuthGuard, RolesGuard, …)
│   │   ├── decorators/        # (added in later steps: @CurrentUser, @Roles, …)
│   │   ├── interceptors/      # (added in later steps)
│   │   └── pipes/             # (added in later steps)
│   └── modules/
│       ├── prisma/            # Global PrismaModule + PrismaService
│       └── health/            # GET /health
└── .env.example               # Template for required env vars
```

## Cross-cutting concerns (already wired up)

- **Validation** — global `ValidationPipe` with `whitelist`, `transform`, `forbidNonWhitelisted`. DTOs decorated with `class-validator` are validated automatically.
- **Prisma errors → HTTP** — `PrismaExceptionFilter` maps `P2002` → 409, `P2025` → 404, `P2003` → 400, others → 500.
- **Fallback exceptions** — `AllExceptionsFilter` catches everything else, logs via Pino, returns a structured JSON envelope.
- **Logging** — `nestjs-pino` with `pino-pretty` in dev (single-line, colorized) and JSON in prod. Sensitive paths (`authorization` header, `cookie`, `password` body field) are redacted automatically.
- **CORS** — origin from `CORS_ORIGIN` (default `http://localhost:3000`) with credentials enabled.
- **Helmet** — security headers applied to every response.
- **Rate limiting** — `@nestjs/throttler` at 10 requests per second per IP, applied globally via `APP_GUARD`. The `/health` endpoint is excluded via `@SkipThrottle()`.

## Roadmap

Full step-by-step plan: see [../IMPLEMENTATION_ROADMAP.md](../IMPLEMENTATION_ROADMAP.md).

- **Step 3 (this):** scaffold + health check
- **Step 10:** JWT auth (login, register, refresh)
- **Step 11:** Google OAuth
- **Step 13:** full Prisma schema (Course, Lesson, Enrollment, Review, …)
- **Step 14:** Courses & Categories public API
- ...
