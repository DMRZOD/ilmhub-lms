# IlmHub — Frontend

Next.js 15 (App Router, Turbopack) + React 19 + TypeScript. UI for the IlmHub LMS;
talks to the NestJS backend over `NEXT_PUBLIC_API_URL`.

## Local development

```bash
pnpm install
cp .env.example .env.local   # then set NEXT_PUBLIC_API_URL=http://localhost:3001
pnpm dev                      # http://localhost:3000
```

The backend must be running on `:3001` (see [../README.md](../README.md) for the full
two-terminal demo walkthrough).

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit/component tests |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm analyze` | Bundle analyzer (`ANALYZE=true`) |

## Environment variables

See [`.env.example`](.env.example). Public (`NEXT_PUBLIC_*`) vars are exposed to the
browser; `SENTRY_*` (without the public prefix) are build-time only.

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL (`http://localhost:3001` in dev) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO/sitemap (defaults to `https://ilmhub.uz`) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN; empty → Sentry no-op |
| `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` | Build-time source-map upload (set in Vercel) |

## Deployment

Deploys to **Vercel** (Root Directory = `frontend`). Full guide:
[../DEPLOYMENT.md](../DEPLOYMENT.md).
