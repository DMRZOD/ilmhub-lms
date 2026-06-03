# IlmHub

A production-ready **Online Learning Platform (LMS)** built for the Uzbek market —
Udemy/Coursera-style courses with an in-browser coding environment, quizzes, video
lessons, certificates, payments (mock), and GitHub-style gamification.

- **Live demo:** https://ilmhub-lms.vercel.app
- **API docs (Swagger):** https://ilmhub-lms-production.up.railway.app/api/docs

**Demo accounts**

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@ilmhub.uz` | `Admin123!` |
| Instructor | `instructor1@ilmhub.uz` | `Instructor123!` |
| Student | `student1@ilmhub.uz` | `Student123!` |

---

## Programming language

**TypeScript** end-to-end (frontend and backend).

## Frameworks & technologies

**Frontend** — Next.js 15 (App Router, Turbopack) · React 19 · Tailwind CSS · shadcn/ui ·
TanStack Query · Zustand · React Hook Form + Zod · Mux Player · Tiptap · Monaco Editor ·
Recharts.

**Backend** — NestJS 11 · Prisma 6 (ORM) · BullMQ (Redis queues) · Passport JWT + Google
OAuth · Swagger/OpenAPI · Pino · Helmet · Puppeteer (PDF certificates) · Resend (email) ·
Mux (video) · Sentry.

**Infrastructure & tooling** — Supabase (PostgreSQL + Storage) · Redis · Vercel (frontend) ·
Railway (backend, Docker) · GitHub Actions (CI/E2E) · Vitest · Jest · Playwright.

## Database

**PostgreSQL** (hosted on Supabase), accessed through **Prisma ORM** with versioned
migrations and a seed script for demo data.

---

## Quick start

**Prerequisites:** Node.js >= 22, [pnpm](https://pnpm.io), a PostgreSQL database
(e.g. a free [Supabase](https://supabase.com) project). Redis is optional for local dev.

Default ports: frontend `:3000`, backend API `:3001`.

### 1. Backend

```bash
cd backend
pnpm install
cp .env.example .env          # set DATABASE_URL, DIRECT_URL and the JWT secrets
pnpm prisma:generate
pnpm db:reset                 # apply migrations + seed demo data (courses, users, ...)
pnpm start:dev                # http://localhost:3001
```

Check it is up: `curl http://localhost:3001/health` → `{"ok":true,"db":"connected"}`.

### 2. Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local    # set NEXT_PUBLIC_API_URL=http://localhost:3001
pnpm dev                      # http://localhost:3000
```

Open http://localhost:3000 and sign in with one of the demo accounts above.

---

## Project structure

```
backend/    NestJS 11 API (Prisma, Supabase, BullMQ, Mux, certificates)
frontend/   Next.js 15 app (App Router, Tailwind, TanStack Query)
```

## Testing

```bash
# backend (Jest unit + e2e)
cd backend && pnpm test

# frontend (Vitest unit + Playwright e2e)
cd frontend && pnpm test && pnpm test:e2e
```
