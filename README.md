# IlmHub

**IlmHub.uz** — O'zbekiston bozori uchun zamonaviy onlayn ta'lim platformasi (LMS). Udemy va Coursera kabi platformalarning O'zbek bozoriga moslashtirilgan versiyasi: professional IT kurslar, brauzer ichidagi interaktiv kod muhiti, real-time progress va GitHub uslubidagi geymifikatsiya.

> 📌 **Презентация / быстрый старт?** Переходите сразу к разделу [🚀 Запуск проекта с нуля](#-запуск-проекта-с-нуля-для-презентации).

## Tech stack

| Слой         | Технологии                                               |
| ------------ | -------------------------------------------------------- |
| Frontend     | Next.js 15 (App Router, Turbopack), React 19, TypeScript |
| Styling      | Tailwind CSS 3, Shadcn UI (new-york), Framer Motion      |
| State / Data | Zustand, TanStack Query, React Hook Form + Zod 4         |
| Backend      | NestJS 11 (TypeScript), Pino, Helmet, Throttler          |
| Database     | Supabase PostgreSQL + Prisma 6 (миграции + seed)         |
| Auth         | JWT + Refresh tokens + Google OAuth                      |
| Payments     | Mock-checkout (Payme / Click / Uzum — заготовки)         |
| Video        | Mux (загрузка через UpChunk, playback через Mux Player)  |
| Storage      | Supabase Storage (обложки курсов)                        |
| Deploy       | Vercel (frontend) + Railway (backend)                    |

Порты по умолчанию: **frontend → `:3000`**, **backend API → `:3001`**.

---

## 🚀 Запуск проекта с нуля (для презентации)

Эта инструкция проведёт вас от чистого ноутбука до работающего сайта на `http://localhost:3000`. Всё уже настроено — Supabase, Google OAuth, Mux и Storage прописаны в `backend/.env`, поэтому отдельно ничего создавать не нужно.

### Шаг 0. Что должно быть установлено

| Инструмент | Версия     | Проверка        | Если нет                                             |
| ---------- | ---------- | --------------- | ---------------------------------------------------- |
| Node.js    | ≥ 20 (LTS) | `node -v`       | Скачать с https://nodejs.org или `brew install node` |
| pnpm       | ≥ 9        | `pnpm -v`       | `npm install -g pnpm` или `corepack enable`          |
| Git        | любая      | `git --version` | `brew install git`                                   |

> Redis **не нужен** — кэш работает в памяти. Интернет нужен (база данных Supabase в облаке).

### Шаг 1. Открыть две вкладки терминала

Нам нужно запустить **два процесса одновременно**: backend (API) и frontend (сайт). Удобнее всего в двух отдельных вкладках/окнах терминала.

### Шаг 2. Запустить Backend (вкладка №1)

```bash
cd ~/Desktop/IlmHub/backend

# 1. Установить зависимости
pnpm install

# 2. Сгенерировать Prisma-клиент
pnpm prisma:generate

# 3. Применить миграции + заполнить базу демо-данными
#    (30 курсов, преподаватели, студенты, отзывы, Q&A, прогресс)
pnpm db:reset

# 4. Запустить API в режиме разработки
pnpm start:dev
```

✅ Готово, когда в консоли появится строка вида `Nest application successfully started` и сервер слушает **http://localhost:3001**.

Проверка в любом терминале:

```bash
curl http://localhost:3001/health
# → {"ok":true,"db":"connected"}
```

> `pnpm db:reset` пересоздаёт базу начисто и заново засевает демо-данные — это даёт гарантированно чистое состояние для презентации. Если хотите сохранить текущие данные и только применить миграции, используйте `pnpm prisma:deploy` вместо `db:reset`.

### Шаг 3. Запустить Frontend (вкладка №2)

```bash
cd ~/Desktop/IlmHub/frontend

# 1. Установить зависимости
pnpm install

# 2. Запустить сайт
pnpm dev
```

✅ Откройте в браузере **http://localhost:3000** — сайт готов к показу.

> Файл `frontend/.env.local` уже содержит `NEXT_PUBLIC_API_URL=http://localhost:3001`, поэтому фронт сразу видит backend.

### Шаг 4. Войти под демо-аккаунтами

После `pnpm db:reset` в базе уже есть готовые пользователи (создаются seed-скриптом):

| Роль             | Email                   | Пароль           | Что показать                                      |
| ---------------- | ----------------------- | ---------------- | ------------------------------------------------- |
| 👨‍💼 Админ         | `admin@ilmhub.uz`       | `Admin123!`      | Админ-панель, модерация                           |
| 👩‍🏫 Преподаватель | `instructor1@ilmhub.uz` | `Instructor123!` | Кабинет `/ustoz`, создание курсов, загрузка видео |
| 👨‍🎓 Студент       | `student1@ilmhub.uz`    | `Student123!`    | Каталог, покупка, плеер уроков, квизы, прогресс   |

> Преподаватели — `instructor1…instructorN@ilmhub.uz`, студенты — `student1…studentN@ilmhub.uz` (пароли у всех одинаковые, см. таблицу).

### Готово 🎉

- **Сайт:** http://localhost:3000
- **API:** http://localhost:3001
- **Swagger (документация API):** http://localhost:3001/api/docs

Чтобы остановить — нажмите `Ctrl + C` в каждой вкладке.

---

## ♻️ Повторный запуск (на следующий день презентации)

Зависимости и база уже на месте, поэтому хватит двух команд:

```bash
cloudflared tunnel --url http://localhost:3001

# Вкладка №1
cd ~/Desktop/IlmHub/backend && pnpm start:dev

# Вкладка №2
cd ~/Desktop/IlmHub/frontend && pnpm dev

# Если порт занят

# backend
lsof -ti:3001 | xargs kill -9

# frontend
lsof -ti:3000 | xargs kill -9

```

Хотите снова свежие демо-данные — добавьте `pnpm db:reset` в backend перед `start:dev`.

---

## 🚢 Production deployment

Полное руководство по деплою — **[DEPLOYMENT.md](DEPLOYMENT.md)**: Vercel (frontend) +
Railway (backend) + Supabase + Redis + Mux + Resend + Sentry, настройка домена
`ilmhub.uz` / `api.ilmhub.uz` (DNS), миграции на деплое и launch-чеклист.

Кратко:

- **Frontend → Vercel.** Root Directory = `frontend`, прод-ветка `main`, preview на
  каждый PR. Переменные: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`,
  `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
  (см. [`frontend/.env.example`](frontend/.env.example)).
- **Backend → Railway.** Root Directory = `backend`; [`backend/railway.json`](backend/railway.json)
  задаёт сборку, healthcheck `/health` и `prisma migrate deploy` перед стартом.
  Переменные — все из [`backend/.env.example`](backend/.env.example); `CORS_ORIGIN`
  принимает список через запятую, превью-домены `*.vercel.app` разрешены автоматически.
- **DB:** Supabase Postgres (pooler + direct). **Redis:** managed (Railway plugin /
  Upstash) для BullMQ. **Storage:** один публичный bucket `course-assets`.
- **Swagger** публичен в проде: `https://api.ilmhub.uz/api/docs` (флаг `SWAGGER_ENABLED`).
- **Sentry** подключён в обоих приложениях; без DSN — no-op.
- **Платежи** пока mock (Шаг 24); реальная интеграция Payme/Click/Uzum — отдельная
  задача, см. DEPLOYMENT.md → Payments.

---
