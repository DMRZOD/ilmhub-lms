# IlmHub — деплой (Vercel + Railway, бесплатные домены)

Без покупки домена. Бэкенд — на Railway (адрес `xxx.up.railway.app`), фронтенд — на
Vercel (адрес `yyy.vercel.app`). БД и остальное (Supabase, Mux, Google, Storage) уже
настроены в локальном `backend/.env` — мы просто скопируем эти значения в Railway.
Новое, что нужно поднять, — только **Redis** для очередей.

Порядок такой: **сначала бэкенд (получим его адрес) → потом фронт (дадим ему адрес
бэкенда) → потом свяжем их обратно**.

---

## ЧАСТЬ 1. Бэкенд на Railway

### Шаг 1. Код уже в GitHub
Изменения запушены в `main`. Railway сам пересобирает при каждом пуше — отдельно
ничего пушить не нужно.

### Шаг 2. Указать папку бэкенда
В Railway открой свой сервис → **Settings** → найди **Root Directory** → впиши `backend`
→ сохрани. (Railway возьмёт сборку из `backend/Dockerfile` и `backend/railway.json`.)

### Шаг 3. Добавить Redis
В проекте нажми **New → Database → Add Redis**. Появится сервис «Redis». Открой его →
вкладка **Variables** (или **Connect**) → скопируй значение `REDIS_URL` (вида
`redis://default:...@...railway.internal:6379`). Понадобится на шаге 4.

### Шаг 4. Переменные окружения
Открой **backend-сервис → вкладка Variables → кнопка «Raw Editor»**.

1. Открой на компьютере файл `backend/.env`, **скопируй всё его содержимое** и вставь
   в Raw Editor.
2. Затем **поправь/добавь** эти строки:

   ```
   NODE_ENV=production
   REDIS_URL=<вставь сюда REDIS_URL из шага 3>
   SWAGGER_ENABLED=true
   ```
   - `NODE_ENV` в локальном `.env` стоит `development` — поменяй на `production`.
   - `REDIS_URL` в локальном `.env` указывает на `localhost` — **обязательно** замени
     на адрес из шага 3, иначе часть страниц будет зависать.

3. `CORS_ORIGIN` и `FRONTEND_URL` пока не трогай — заполним в Части 3, когда узнаем
   адрес фронта. (Превью-домены `*.vercel.app` и так разрешены автоматически.)

Сохрани. Railway сразу начнёт новую сборку.

### Шаг 5. Дать бэкенду публичный адрес
**Settings → Networking → Generate Domain**. Railway выдаст адрес вида
`https://ilmhub-lms-production.up.railway.app`. **Запиши его** — это `BACKEND_URL`.

### Шаг 6. Дождаться сборки и проверить
**Deployments** → открой последний деплой. В логах сборки должно пройти:
`apt-get install chromium…` ✓ → `pnpm install` → `pnpm build` → pre-deploy
`prisma migrate deploy` → старт → зелёный healthcheck `/health`.

Проверь в браузере / терминале:
```
curl https://<BACKEND_URL>/health      # → {"ok":true,"db":"connected"}
```
Открой `https://<BACKEND_URL>/api/docs` — должна открыться документация API (Swagger).

> Если сборка/старт падает — открой **View logs**, скопируй ошибку. Чаще всего это
> незаполненная обязательная переменная (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`,
> `JWT_REFRESH_SECRET`) или неверный `REDIS_URL`.

---

## ЧАСТЬ 2. Фронтенд на Vercel

### Шаг 7. Создать проект
Vercel → **Add New… → Project** → импортируй репозиторий `DMRZOD/ilmhub-lms`.

### Шаг 8. Настройки проекта
- **Root Directory = `frontend`** (нажми Edit рядом с Root Directory и выбери `frontend`).
- Framework определится сам (Next.js).

### Шаг 9. Переменные окружения (раздел Environment Variables)
| Имя | Значение |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | адрес бэкенда из шага 5, напр. `https://ilmhub-lms-production.up.railway.app` |
| `NEXT_PUBLIC_SITE_URL` | адрес фронта на Vercel (узнаешь после деплоя; можно вписать позже) |

Sentry-переменные (`NEXT_PUBLIC_SENTRY_DSN` и т.д.) можно **оставить пустыми** — без них
сайт работает, просто без сбора ошибок.

### Шаг 10. Deploy
Нажми **Deploy**. После сборки Vercel даст адрес вида `https://ilmhub-lms.vercel.app` —
**запиши его**, это `FRONTEND_URL`.

---

## ЧАСТЬ 3. Связать бэкенд и фронт

### Шаг 11. Прописать адрес фронта в Railway
Вернись в **Railway → backend → Variables** и добавь/поправь:
```
FRONTEND_URL=https://<FRONTEND_URL>
CORS_ORIGIN=https://<FRONTEND_URL>
```
Сохрани — Railway перезапустит сервис. (`FRONTEND_URL` нужен для ссылок в письмах и на
странице проверки сертификата.)

### Шаг 12. (необязательно) Дописать SITE_URL на Vercel
Vercel → проект → **Settings → Environment Variables** → задай
`NEXT_PUBLIC_SITE_URL=https://<FRONTEND_URL>` и нажми **Redeploy** (чтобы карта сайта и
SEO-ссылки указывали на реальный адрес).

### Шаг 13. (необязательно) Google-вход и Mux-вебхук
Эти фичи работают, только если поправить внешние сервисы:
- **Google OAuth**: в Google Cloud Console добавь redirect URI
  `https://<BACKEND_URL>/auth/google/callback`, и в Railway задай
  `GOOGLE_CALLBACK_URL` на это же значение. Без этого обычный вход email+пароль всё равно
  работает.
- **Mux**: если будешь загружать новые видео, в Mux вебхук укажи
  `https://<BACKEND_URL>/webhooks/mux`. Засеянные демо-видео играют и без этого.

---

## ЧАСТЬ 4. Проверка
1. Открой `https://<FRONTEND_URL>` — сайт грузится.
2. Войди демо-аккаунтом (см. корневой `README.md`): `student1@ilmhub.uz` / `Student123!`.
3. Открой каталог, зайди в курс, запусти урок-видео.
4. `https://<BACKEND_URL>/health` → `{"ok":true,...}`, `https://<BACKEND_URL>/api/docs` —
   Swagger.

Готово — сайт работает на бесплатных доменах. 🎉

---

## Шпаргалка по переменным (Railway → backend)
Большинство **копируется как есть из локального `backend/.env`**. Меняешь только:

| Переменная | Что поставить |
| --- | --- |
| `NODE_ENV` | `production` |
| `REDIS_URL` | адрес Redis из Части 1, шаг 3 (НЕ localhost) |
| `FRONTEND_URL` | адрес фронта на Vercel |
| `CORS_ORIGIN` | адрес фронта на Vercel |
| `SWAGGER_ENABLED` | `true` |
| `GOOGLE_CALLBACK_URL` | `https://<BACKEND_URL>/auth/google/callback` (если нужен Google-вход) |

Остальное (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `MUX_*`,
`SUPABASE_*`, `RESEND_API_KEY`, `EMAIL_FROM`) — **как в локальном `.env`**.
`PORT` задавать не нужно — Railway передаёт сам.

> Примечание: если скопировать `DATABASE_URL` из локального `.env`, прод и локальная
> разработка будут работать с одной и той же базой Supabase (для демо это нормально).

---

## Что отложено / не входит
- **Свой домен `ilmhub.uz`** — не покупается; используем бесплатные адреса. (Если
  передумаешь — в Vercel/Railway есть раздел Custom Domain, нужно будет настроить DNS.)
- **Платежи (Payme/Click/Uzum)** — пока mock-режим (Шаг 24). Реальная интеграция —
  отдельная задача, требует регистрации мерчанта.
- **Sentry** — код подключён, но без `*_SENTRY_DSN` просто выключен; можно включить позже,
  заполнив переменные.
