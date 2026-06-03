# IlmHub — Production Deployment Guide

Architecture: **Vercel** (frontend, `ilmhub.uz`) + **Railway** (backend, `api.ilmhub.uz`)
+ **Supabase** (Postgres & Storage) + managed **Redis** (BullMQ) + **Mux** (video) +
**Resend** (email) + **Sentry** (errors).

> The repo is already made deploy-ready in code (this commit). The steps below are
> the **manual** account/dashboard/DNS work — they cannot be done from the codebase.
> Items marked **🔧 manual** are yours; everything in `railway.json`, `next.config.ts`,
> `.env.example`, etc. is already in the repo.

---

## 0. Prerequisites
- GitHub repo pushed: `github.com/DMRZOD/ilmhub-lms`, default branch `main`.
- Accounts: Vercel, Railway, Supabase, Mux, Resend, Sentry, an uptime monitor
  (UptimeRobot or BetterStack), and access to DNS for `ilmhub.uz`.
- Generate two JWT secrets: `openssl rand -base64 32` (run twice).

---

## 1. 🔧 Frontend — Vercel
1. **New Project** → import `DMRZOD/ilmhub-lms`.
2. **Root Directory = `frontend`**. Framework auto-detects Next.js; pnpm auto-detected
   from the lockfile + `packageManager` field.
3. **Environment Variables** (Production **and** Preview):
   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | `https://api.ilmhub.uz` |
   | `NEXT_PUBLIC_SITE_URL` | `https://ilmhub.uz` |
   | `NEXT_PUBLIC_SENTRY_DSN` | DSN of your Sentry **Next.js** project |
   | `SENTRY_AUTH_TOKEN` | Sentry org auth token (source-map upload) |
   | `SENTRY_ORG` | your Sentry org slug |
   | `SENTRY_PROJECT` | your Sentry Next.js project slug |
4. **Production branch = `main`** (default). **Preview deployments = on** for every PR
   (default). Preview frontends can call the prod API — the backend CORS already
   allows `*.vercel.app`.
5. **Domains** → add `ilmhub.uz` and `www.ilmhub.uz` (DNS in §8). SSL is automatic.

> No `vercel.json` is needed — Root Directory + auto-detection cover it.

---

## 2. 🔧 Backend — Railway
1. **New Project → Deploy from GitHub repo** → pick `DMRZOD/ilmhub-lms`.
2. Service settings → **Root Directory = `backend`**. Railway reads
   [`backend/railway.json`](backend/railway.json): Nixpacks build, healthcheck `/health`,
   and a **pre-deploy** `pnpm prisma migrate deploy` that runs migrations against
   `DIRECT_URL` *before* the new release serves traffic.
3. **Add Redis** — Railway → *New → Database → Redis* (or external Upstash). Copy its
   connection string into `REDIS_URL`.
4. **Variables** — set every var from [`backend/.env.example`](backend/.env.example):

   | Variable | Production value / source |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `PORT` | injected by Railway (leave unset) |
   | `CORS_ORIGIN` | `https://ilmhub.uz,https://www.ilmhub.uz` |
   | `DATABASE_URL` | Supabase **pooler** string (port 6543, `?pgbouncer=true`) |
   | `DIRECT_URL` | Supabase **direct** string (port 5432) |
   | `JWT_SECRET` / `JWT_REFRESH_SECRET` | `openssl rand -base64 32` (distinct) |
   | `FRONTEND_URL` | `https://ilmhub.uz` |
   | `REDIS_URL` | from the Redis service |
   | `RESEND_API_KEY` / `EMAIL_FROM` | §6 — `notifications@ilmhub.uz` |
   | `MUX_TOKEN_ID` … `MUX_WEBHOOK_SECRET` | §5 |
   | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_STORAGE_BUCKET` | §4 (`course-assets`) |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud console |
   | `GOOGLE_CALLBACK_URL` | `https://api.ilmhub.uz/auth/google/callback` |
   | `SENTRY_DSN` | DSN of your Sentry **Node** project |
   | `SWAGGER_ENABLED` | `true` (Swagger public at `/api/docs`) |

5. After first deploy, check the logs: the pre-deploy step should print applied
   migrations, and the healthcheck on `/health` should pass.
6. **Domain** → add `api.ilmhub.uz`; Railway shows a CNAME target for DNS (§8).
7. 🔧 In **Google Cloud Console**, add `https://api.ilmhub.uz/auth/google/callback`
   as an authorized redirect URI.

---

## 3. 🔧 Supabase (Postgres + Storage)
- Use a **dedicated production project** (recommended) or reuse the current one.
  Copy the **pooler** connection → `DATABASE_URL`, **direct** → `DIRECT_URL`.
- **Storage** → create **one public bucket** named exactly what `SUPABASE_STORAGE_BUCKET`
  is set to (`course-assets`). It must be **public-read** — the backend serves uploads
  via `getPublicUrl`. The app stores everything in this one bucket under path prefixes
  (`courses/<uuid>.webp`, `certificates/<number>.pdf`). **You do not need 4 buckets.**
- Put `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` into Railway.
- **RLS is not required**: Prisma connects via the direct/pooler URL with the service
  role and bypasses RLS; the storage bucket is intentionally public-read.
- **Backups**: enable Supabase Pro daily backups / PITR.

---

## 4. 🔧 Mux (video, production)
- Create a production **Access Token** → `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`.
- Create a **Signing Key** → `MUX_SIGNING_KEY_ID`, `MUX_PRIVATE_KEY` (base64 RSA).
- Add a **Webhook** → `https://api.ilmhub.uz/webhooks/mux` → `MUX_WEBHOOK_SECRET`.

## 5. 🔧 Resend (email, production)
- Verify the domain `ilmhub.uz` (add the SPF/DKIM DNS records Resend provides).
- Create an API key → `RESEND_API_KEY`. Set `EMAIL_FROM=notifications@ilmhub.uz`.

## 6. 🔧 Monitoring
- **Uptime**: UptimeRobot / BetterStack → monitor `https://api.ilmhub.uz/health`
  (returns `{"ok":true,"db":"connected"}`) and `https://ilmhub.uz`.
- **Sentry**: create two projects (Next.js + Node), paste DSNs into Vercel/Railway,
  set alert rules. Verify by triggering a test error after launch.
- **Logs**: Railway and Vercel have built-in log viewers; add a Logtail/BetterStack
  drain if you want retention.

---

## 7. Migrations on deploy
Handled automatically: `railway.json` `deploy.preDeployCommand` runs
`pnpm prisma migrate deploy` before each release. Migrations are **never** run at
Vercel build time (the frontend has no DB). To check status manually:
`cd backend && pnpm prisma migrate status`.

---

## 8. 🔧 DNS for `ilmhub.uz`
`.uz` domains are managed via the local registrar (cctld.uz / e.g. ahost). Pick one:

**Option A — records at your current registrar (simplest):**
| Host | Type | Value |
| --- | --- | --- |
| `@` (apex) | A | `76.76.21.21` (Vercel) |
| `www` | CNAME | `cname.vercel-dns.com` |
| `api` | CNAME | the target Railway shows for the custom domain |

**Option B — Cloudflare nameservers:** move NS to Cloudflare, recreate the records
above. Set the Vercel/Railway records to **DNS only (grey cloud)** to avoid SSL
conflicts (or rely on Cloudflare CNAME-flattening for the apex). Cloudflare also holds
the Resend SPF/DKIM and Mux records.

**Option C — apex CNAME flattening:** if the registrar supports ALIAS/ANAME on the
apex, point it at `cname.vercel-dns.com` instead of the A record.

SSL certificates are auto-provisioned by Vercel and Railway once DNS resolves.

---

## 9. Deployment flow (CI/CD)
- **Native Git integration** (no custom deploy workflow): pushing to `main` auto-deploys
  prod on both Vercel and Railway; every PR gets a Vercel preview.
- The existing `.github/workflows/ci.yml` and `e2e.yml` remain the quality gate
  (lint, typecheck, tests, Playwright). They do not deploy.

---

## 10. Payments — future task (NOT in this deploy)
The checkout/webhook flow is still the **Step-24 mock**. Going live with real payments
is a separate effort:
1. 🔧 Obtain production merchant credentials (needs business onboarding, takes weeks):
   - Payme: `PAYME_MERCHANT_ID`, `PAYME_KEY`
   - Click: `CLICK_SERVICE_ID`, `CLICK_MERCHANT_ID`, `CLICK_SECRET`
   - Uzum: `UZUM_MERCHANT_ID`, `UZUM_SECRET`
   (placeholders already reserved in `.env.example` / env schema, currently unused)
2. Replace the mock gateway + webhook with the real provider APIs + signature
   verification.
3. Then run the **real-card production payment test** from the launch checklist.

---

## 11. Launch checklist
- [ ] SSL active (Vercel + Railway, automatic)
- [ ] `ilmhub.uz`, `www.ilmhub.uz`, `api.ilmhub.uz` resolve
- [ ] `curl https://api.ilmhub.uz/health` → `{"ok":true,...}` + uptime monitor green
- [ ] Swagger public at `https://api.ilmhub.uz/api/docs`
- [ ] Sentry receiving FE **and** BE events (trigger a test error)
- [ ] Resend domain verified; a real email delivered
- [ ] Supabase prod bucket public + backups enabled
- [ ] Privacy (`/privacy`) & Terms (`/terms`) reviewed — already shipped in Uzbek
- [ ] Contact email (`salom@ilmhub.uz`) monitored; support process documented
- [ ] _(Deferred)_ Real-card payment test — after §10
