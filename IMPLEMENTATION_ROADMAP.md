# IlmHub.uz — Пошаговый план разработки

## Context

**Проект:** IlmHub.uz — LMS платформа для профессиональных IT курсов в Узбекистане (аналог Udemy/Coursera для узбекского рынка).

**Что у нас уже есть:**

- `/Users/dmrzod/Desktop/IlmHub/requirements.md` — техническое задание
- `/Users/dmrzod/Desktop/IlmHub/design-system/` — готовая дизайн-система (премиум монохром: чёрный/белый/серый, Sora font, Lucide icons, токены в `colors_and_type.css`, JSX-прототипы в `ui_kits/web/`)

**Решения по архитектуре (на основе ответов пользователя):**

- **Структура:** две папки рядом — `IlmHub/frontend/` (Next.js) и `IlmHub/backend/` (NestJS)
- **Порядок:** Frontend сначала на mock-данных → потом Backend → потом интеграция
- **Детализация:** ~37 средних шагов, каждый = одна логически завершённая фича
- **MVP-приоритет:** Core (Auth + Catalog + Course Details + Enroll + Learning + Student Dashboard) → Instructor → Admin → Payments → Coding Exercises → Blog → i18n

**Tech stack (из requirements.md):**

- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Shadcn UI + Framer Motion + Lucide
- Backend: NestJS + Prisma + Supabase PostgreSQL
- Auth: JWT + Refresh Tokens + Google OAuth
- Video: Mux или Cloudflare Stream
- Платежи: Payme, Click, Uzum
- Deploy: Vercel (frontend) + Railway (backend)

**Дополнения от меня (помимо requirements.md):**

- `zustand` или `jotai` для глобального state
- `@tanstack/react-query` для server-state и кэширования
- `react-hook-form` + `zod` для форм и валидации
- `next-intl` для i18n
- `nodemailer` + Resend для отправки email
- `class-validator` + `class-transformer` на бэке
- `pino` для structured logging
- `bullmq` + Redis для очередей (email, video processing webhooks)

---

## Как пользоваться этим документом

1. Каждый шаг ниже = один промпт, который вы копируете и присылаете мне в новой сессии
2. Промпты самодостаточны — каждый содержит контекст того, что должно быть сделано
3. **Шаг 1** создаст файл `IlmHub/IMPLEMENTATION_ROADMAP.md` — копию этого плана в самом проекте, чтобы у вас был быстрый доступ
4. Каждый шаг заканчивается чек-листом верификации — пробегите его перед переходом к следующему
5. Если что-то нужно поменять между шагами — просто скажите, не обязательно идти строго по плану

---

# STAGE 0 — SETUP (Шаги 1–3)

## Шаг 1. Инициализация структуры проекта + Frontend (Next.js + design tokens)

**Что делаем:** создаём `frontend/` с Next.js 15 (App Router, TypeScript, Tailwind), импортируем токены и шрифты из `design-system/`, настраиваем базовый layout. Также копируем этот roadmap в `IMPLEMENTATION_ROADMAP.md` в корне проекта.

**Промпт:**

```
Прочитай requirements.md и design-system/README.md. Создай в корне IlmHub папку frontend/ с Next.js 15 (App Router, TypeScript, Tailwind, ESLint, src директория, pnpm). Внутри:

1. Интегрируй дизайн-систему: скопируй colors_and_type.css и fonts/ из design-system/project/ внутрь frontend/public или frontend/src/styles так, чтобы все токены (--ilm-ink, --ilm-surface, --r-2xl и т.д.) и Sora font работали глобально.
2. Сконфигурируй tailwind.config.ts так, чтобы все токены из CSS variables (цвета, радиусы, тени, spacing, font-sizes, durations) были доступны как Tailwind utility-классы. Также подключи плагин tailwindcss-animate.
3. Установи и сконфигурируй Shadcn UI (init с зависимостями new-york style, neutral base color, CSS variables = on).
4. Установи: framer-motion, lucide-react, zustand, @tanstack/react-query, react-hook-form, zod, @hookform/resolvers, clsx, tailwind-merge.
5. Создай базовую структуру папок: src/app, src/components/ui (для shadcn), src/components/shared, src/components/layout, src/lib, src/hooks, src/types, src/styles, src/features (по фиче-папкам), src/config, src/mocks.
6. Создай src/lib/utils.ts с функцией cn() (clsx + twMerge).
7. Создай src/app/layout.tsx с глобальным импортом стилей, метаданными (lang="uz"), и Sora как font-family.
8. Создай src/app/page.tsx с placeholder "IlmHub" + кнопкой из Shadcn, чтобы проверить что всё работает.
9. Создай корневой README.md в IlmHub/ с описанием проекта и структуры.
10. Скопируй содержимое /Users/dmrzod/.claude/plans/requirements-md-swift-gizmo.md в /Users/dmrzod/Desktop/IlmHub/IMPLEMENTATION_ROADMAP.md (чтобы у меня был roadmap внутри проекта).
11. Создай .gitignore для всего IlmHub.
12. Запусти dev сервер и убедись, что страница рендерится с Sora шрифтом и работающей Shadcn кнопкой.

Не создавай backend — это будет в шаге 3. Не создавай страницы кроме home placeholder — это шаг 4.
```

**Verify:** `pnpm dev` запускается, главная страница показывает Sora шрифт и Shadcn кнопку, IMPLEMENTATION_ROADMAP.md существует.

---

## Шаг 2. Базовые UI-компоненты на основе дизайн-системы

**Что делаем:** портируем примитивы из `design-system/project/ui_kits/web/components.jsx` в продакшен-ready React+TS компоненты с использованием Tailwind+Shadcn.

**Промпт:**

```
Прочитай design-system/project/README.md, design-system/project/ui_kits/web/components.jsx и design-system/project/ui_kits/web/styles.css. Создай в frontend/src/components/ui/ продакшен-ready версии примитивов IlmHub (TypeScript + Tailwind + cva + Framer Motion где нужно):

- ilm-button.tsx: варианты primary (чёрная заливка), secondary (1px чёрный бордер), ghost (без бордера, hover = ilm-surface). Размеры: sm/md/lg. Иконка слева/справа. Press scale 0.97.
- ilm-icon.tsx: обёртка над lucide-react с дефолтными размерами/strokeWidth по гайдлайнам.
- ilm-pill.tsx: tone neutral/success/warning/error/info. Полностью скруглённая.
- ilm-avatar.tsx: размеры 32/48/80px, инициалы как fallback, ink-вариант (чёрный фон, белый текст).
- ilm-tile.tsx: квадратик 12-16px радиуса, ink/surface варианты, иконка внутри.
- ilm-card.tsx: surface/paper фон, 24px радиус, no border, shadow-sm → shadow-md + translateY(-2px) на hover. hoverable prop.
- ilm-progress.tsx: 8px, fully rounded, ink fill, border track.
- ilm-field.tsx: pill или 12px-rounded input, surface фон, no border на rest, ink border на focus, optional icon слева.

Все компоненты должны использовать токены из tailwind config (bg-ilm-ink, rounded-ilm-2xl, shadow-ilm-md и т.п.) — никаких хардкод цветов. Каждый компонент должен иметь forwardRef где это input/button.

Также создай src/app/(dev)/preview/page.tsx — отдельную приватную dev-страницу с галереей всех компонентов во всех вариантах, чтобы я мог визуально проверить. Маршрут /preview.

Не трогай главную страницу. Не создавай business-компоненты типа CourseCard — это следующий шаг.
```

**Verify:** `/preview` отображает все примитивы во всех состояниях, hover/press работают плавно, цвета и радиусы соответствуют дизайн-системе.

---

## Шаг 3. Backend setup (NestJS + Prisma + Supabase)

**Что делаем:** создаём `backend/` с NestJS, подключаем Prisma + Supabase PostgreSQL, базовый health check.

**Промпт:**

```
Создай в IlmHub папку backend/ с NestJS (pnpm, TypeScript). Внутри:

1. Установи: @nestjs/config, @nestjs/jwt, @nestjs/passport, passport, passport-jwt, passport-google-oauth20, @prisma/client, prisma, class-validator, class-transformer, bcrypt, nestjs-pino, pino-http, bullmq @nestjs/bullmq ioredis, nodemailer, resend, @nestjs/throttler, helmet.
2. Сконфигурируй ConfigModule (загрузка .env, валидация через zod схему).
3. Инициализируй Prisma, создай schema.prisma с datasource (PostgreSQL через Supabase DATABASE_URL и DIRECT_URL для миграций) и generator. Пока что только модель User (id, email, passwordHash?, role, name, avatarUrl?, emailVerified, createdAt, updatedAt) — полную схему сделаем в шаге 13.
4. Создай PrismaModule (global) с PrismaService.
5. Создай структуру: src/modules/, src/common/ (guards, decorators, filters, interceptors, pipes), src/config/.
6. Глобальный ValidationPipe (whitelist, transform). Глобальный exception filter (Prisma errors → HTTP). Pino logger.
7. Health check endpoint GET /health (возвращает { ok: true, db: 'connected' }).
8. CORS настроен для http://localhost:3000.
9. Включи Helmet и Throttler (10 req/sec на IP по умолчанию).
10. Создай .env.example с DATABASE_URL, DIRECT_URL, JWT_SECRET, JWT_REFRESH_SECRET, GOOGLE_CLIENT_ID/SECRET, RESEND_API_KEY, REDIS_URL, MUX_TOKEN_ID/SECRET (placeholder), PAYME_MERCHANT_ID (placeholder), CORS_ORIGIN.
11. README.md в backend/ с инструкциями: создать Supabase проект, прописать DATABASE_URL, prisma migrate dev, pnpm start:dev.

Спроси меня про Supabase DATABASE_URL — либо я предоставлю, либо ты оставишь placeholder в .env и я заполню сам перед запуском.

Сервер должен запускаться на :3001 и /health должен отвечать.
```

**Verify:** `pnpm start:dev` запускается, `curl localhost:3001/health` отвечает (при наличии валидного DATABASE_URL).

---

# STAGE 1 — PUBLIC WEBSITE на mock-данных (Шаги 4–8)

## Шаг 4. Layout (Header + Footer) + Home page

**Промпт:**

```
В frontend/ создай публичный layout и главную страницу IlmHub. Все строки на узбекском (латиница), следуй tone-of-voice из design-system/project/README.md.

1. src/components/layout/public-header.tsx: логотип IlmHub (из design-system/project/assets/logo/ilmhub-wordmark.svg — скопируй в frontend/public/), навигация (Bosh sahifa, Kurslar, Blog, Biz haqimizda), search bar (ilm-field с иконкой search), кнопки "Kirish" (secondary) и "Ro'yxatdan o'tish" (primary). Sticky top. На мобильном — burger menu (Sheet из shadcn).
2. src/components/layout/public-footer.tsx: 4 колонки (Kompaniya / Kurslar / Yordam / Aloqa) + социальные сети + копирайт. Тёмный фон (ilm-ink) с инверсным логотипом.
3. src/app/(public)/layout.tsx: route group с PublicHeader + main + PublicFooter.
4. src/app/(public)/page.tsx — главная страница, секции (в порядке):
   - Hero: H1 "Kelajak kasbingizni bugun o'rganing", подзаголовок, search bar, две CTA ("Kurslarni ko'rish" primary, "Bepul boshlash" secondary), справа — Mascot иллюстрация (используй SVG из design-system/project/ui_kits/web/components.jsx, функция Mascot).
   - Statistics: 4 счётчика (10,000+ talaba, 200+ kurs, 50+ ustoz, 95% tugatish darajasi) — анимация count-up через framer-motion.
   - Featured courses: 4 CourseCard (создай src/components/features/courses/course-card.tsx по образцу design-system/project/ui_kits/web/Home.jsx и Browse.jsx).
   - Popular categories: 6-8 CategoryCard с иконкой Lucide (Frontend, Backend, Mobile, Design, DevOps, Data Science, AI, Cybersecurity).
   - Top instructors: 4 InstructorCard (аватар, имя, специализация, кол-во студентов).
   - Student testimonials: карусель из 3-6 отзывов (Embla Carousel).
   - CTA section: чёрная карточка "Yangi kurs yaratmoqchimisiz?" с кнопкой стать инструктором.
   - FAQ: Accordion из shadcn, 6-8 вопросов.
5. src/mocks/ — создай mock-данные:
   - courses.ts (16 курсов: id, title, slug, instructorName, instructorAvatar, thumbnail (используй placeholder.co или unsplash), category, level, price, rating, ratingCount, studentsCount, durationHours, lessonsCount, language, description, learningOutcomes[], requirements[]).
   - categories.ts (8 категорий).
   - instructors.ts (8 инструкторов).
   - testimonials.ts (6 отзывов).
6. Все секции должны быть в отдельных компонентах в src/components/features/home/ (HeroSection, StatsSection, FeaturedCourses и т.д.).
7. Используй framer-motion для fade+8px translate появления секций на scroll (whileInView).
8. Полностью адаптивный (mobile-first), брейкпойнты Tailwind по умолчанию.

Не делай catalog/course-details — это следующие шаги.
```

**Verify:** главная отображается красиво на desktop и mobile, все секции на узбекском, анимации работают плавно, mock-данные подгружаются.

---

## Шаг 5. Курс-каталог (search, filters, sorting, pagination)

**Промпт:**

```
В frontend/src/app/(public)/kurslar/page.tsx создай страницу каталога курсов.

Layout: слева sidebar с фильтрами (на mobile — Sheet drawer), справа grid карточек.

Фильтры (используй mock-данные из src/mocks/courses.ts):
- Category (multi-select checkbox group)
- Level (Boshlang'ich / O'rta / Yuqori, radio group)
- Price (range slider или checkboxes: Bepul / $0-50 / $50-100 / $100+)
- Rating (4★+, 3★+, 2★+ radio)
- Duration (0-5h / 5-15h / 15-40h / 40h+)
- Language (Uzbek / Russian / English)

Topbar над gridом:
- Search input (live filter по title и description)
- Sort dropdown (Mashhurlik / Yangi / Reyting / Narx oshish / Narx pasayish)
- Toggle grid/list view
- Счётчик "245 ta kurs topildi"

Course Card должен показывать: thumbnail (16:9), category pill, title, instructor (avatar + name), rating (★ + число + (245)), duration + lessons count, price (или "Bepul"), hover → lift + shadow-md.

Pagination внизу (12 на страницу) — используй shadcn Pagination.

State management: используй nuqs или useSearchParams чтобы фильтры были в URL (shareable). React Query необязателен здесь — фильтрация на клиенте по mock.

Skeleton loading states для карточек (1 секунда искусственная задержка чтобы видеть).

Empty state когда нет совпадений: иллюстрация Mascot + "Hech narsa topilmadi" + кнопка "Filtrlarni tozalash".

Все строки на узбекском.
```

**Verify:** /kurslar показывает все курсы из mock, фильтры реально фильтруют, sort работает, search live, pagination работает, URL обновляется при изменении фильтров.

---

## Шаг 6. Course Details страница

**Промпт:**

```
Создай src/app/(public)/kurslar/[slug]/page.tsx — страницу деталей курса.

Layout: двухколоночный (на desktop 8/4 grid).

Левая колонка:
- Hero блок: category pill сверху, H1 title, короткое описание (subtitle), мета-инфа (★ rating (количество отзывов), N talaba, N soat, N dars, til, oxirgi yangilanish), avatar+name инструктора с link на профиль.
- Tabs (shadcn Tabs):
  - "Tavsif" — описание (rich text)
  - "O'rganasiz" — grid 2 колонки с галочками (learningOutcomes)
  - "Dasturi" — Accordion: секции → уроки (название, длительность, иконка play/lock, превью урока clickable)
  - "Ustoz" — bio инструктора, фото, статистика, ссылка на профиль
  - "Sharhlar" — рейтинг breakdown (5★/4★/3★/2★/1★ с прогресс-барами), список отзывов с avatar+name+date+star+text
- "Talablar" блок с галочками (requirements)

Правая колонка (sticky on desktop, sticky bottom bar on mobile):
- Preview video player (заглушка с poster + play overlay — реальное видео в шаге 19)
- Цена (большая, либо "Bepul")
- Primary button "Sotib olish" (full width)
- Secondary button "Sevimlilarga qo'shish" (с heart icon)
- "Bu kursda" список с иконками: N video soat, N maqola, N yuklab olish, sertifikat, umrbod kirish, mobil va TV
- Share buttons (Telegram, Facebook, copy link)

Под основным контентом: "Shunga o'xshash kurslar" — 4 CourseCard.

Mock-данные расширь в src/mocks/courses.ts: добавь sections[] (с lessons[]), reviews[], detailedDescription, longInstructorBio.

Используй generateStaticParams для статической генерации страниц курсов из mock-данных.

Hero video player это просто Image с overlay <Icon name="play-circle" /> — клик пока ничего не делает.

Все строки на узбекском.
```

**Verify:** /kurslar/{любой-slug} рендерится, табы переключаются, accordion раскрывается, "Sotib olish" пока не работает (это будущий шаг).

---

## Шаг 7. Категории + публичные профили инструкторов

**Промпт:**

```
В frontend создай две страницы:

1. src/app/(public)/kategoriyalar/page.tsx — список всех категорий в виде grid карточек с иконкой Lucide, названием категории, кол-вом курсов. Клик ведёт на /kategoriyalar/[slug].

2. src/app/(public)/kategoriyalar/[slug]/page.tsx — страница категории: hero с названием и описанием категории, далее переиспользуй компонент каталога курсов (отфильтрованного по этой категории). Можно вынести общую часть catalog'а из шага 5 в src/features/courses/components/course-grid.tsx чтобы переиспользовать.

3. src/app/(public)/ustozlar/page.tsx — список инструкторов (grid карточек: avatar, name, specialty, rating, кол-во студентов, кол-во курсов). Sort и search.

4. src/app/(public)/ustozlar/[username]/page.tsx — публичный профиль инструктора:
   - Hero: большой avatar, name, title, краткое bio, статистика (talabalar, kurslar, reyting, sharhlar), кнопки follow / message (пока без логики).
   - Tabs: "Kurslar" (его курсы), "Haqida" (длинное bio), "Sharhlar" (отзывы о нём).

Расширь mocks: добавь instructors с username, longBio, socialLinks, statistics, и links к курсам.

Все на узбекском.
```

**Verify:** все 4 страницы работают, навигация между категорией → курсами → инструктором → его профилем функциональна.

---

## Шаг 8. Контакт + О нас + полировка public website

**Промпт:**

```
1. src/app/(public)/biz-haqimizda/page.tsx — страница "О нас":
   - Hero с миссией
   - Story section (как появилась IlmHub)
   - Values: 3-4 ценности с иконками Lucide
   - Team section: команда (используй mock instructors как placeholder)
   - Stats (повтор из главной)
   - CTA "Bizga qo'shiling"

2. src/app/(public)/aloqa/page.tsx — страница контактов:
   - Левая колонка: контакты (телефон, email, адрес офиса в Ташкенте — placeholder), social links, embedded Yandex/Google Map (можно <iframe> placeholder)
   - Правая колонка: contact form (react-hook-form + zod): name, email, subject, message. Submit пока делает console.log + toast "Xabaringiz yuborildi" (используй sonner из shadcn).

3. src/app/(public)/maxfiylik/page.tsx и /foydalanish-shartlari/page.tsx — placeholder страницы политики конфиденциальности и условий использования (lorem ipsum на узбекском).

4. Полировка:
   - 404 страница (src/app/not-found.tsx) с Mascot + "Sahifa topilmadi" + кнопка вернуться.
   - Loading состояния (src/app/(public)/loading.tsx) — skeleton.
   - Error boundary (src/app/error.tsx).
   - Прокрути все public страницы и убедись что нет хардкод цветов, типографика консистентна, все строки на узбекском.

5. Добавь Open Graph meta-теги в layout (название, описание, изображение).
6. Добавь robots.txt и sitemap.ts.

Не трогай auth — это следующий stage.
```

**Verify:** все public страницы открываются, контактная форма валидируется, 404 работает, SEO meta присутствуют.

---

# STAGE 2 — AUTH (Шаги 9–12)

## Шаг 9. Frontend Auth UI (Login, Register, Forgot Password)

**Промпт:**

```
В frontend создай auth UI (пока без реального backend, mocked).

1. src/app/(auth)/layout.tsx — split layout: слева форма (max 480px), справа панель с Mascot и мотивационным текстом + background ilm-surface (как design-system/project/ui_kits/web/SignIn.jsx).

2. src/app/(auth)/kirish/page.tsx (Login):
   - Form fields: email, password (с toggle visibility).
   - "Parolni unutdingizmi?" link → /parol-tiklash.
   - Submit button "Kirish".
   - Divider "yoki".
   - Google OAuth button (logo + "Google bilan kirish").
   - Footer link "Akkauntingiz yo'qmi? Ro'yxatdan o'ting".

3. src/app/(auth)/royxatdan-otish/page.tsx (Register):
   - Form: name, email, password (с показателем сложности), confirm password.
   - Role selection: radio "Talaba" / "Ustoz" (default talaba).
   - Checkbox "Foydalanish shartlariga roziman".
   - Google OAuth.
   - Submit "Ro'yxatdan o'tish".

4. src/app/(auth)/parol-tiklash/page.tsx (Forgot Password): email → submit → "Email yuborildi" success state.

5. src/app/(auth)/parol-tiklash/[token]/page.tsx (Reset Password): new password + confirm.

6. src/app/(auth)/emailni-tasdiqlash/page.tsx (Verify Email): "Email tasdiqlandi" + redirect / "Email tasdiqlashda xato" с кнопкой resend.

Валидация: react-hook-form + zod. Схемы в src/features/auth/schemas.ts.

Состояния: loading (spinner на кнопке), error (inline под полем + toast), success.

Mock-логика в src/features/auth/api.ts: signIn(), signUp(), forgotPassword() — все возвращают fake delay + успех. Сохраняй "пользователя" в zustand store (src/features/auth/store.ts) с persist в localStorage.

После успешного login/register — redirect на /dashboard (заглушка пока что — просто middleware-protected route).

Создай src/middleware.ts: если нет fake auth-токена в cookie, /dashboard/* и /ustoz/* и /admin/* редиректят на /kirish.

Все на узбекском.
```

**Verify:** все формы валидируются, signIn с любым email/password ведёт на /dashboard, redirect logic работает.

---

## Шаг 10. Backend Auth (JWT + Refresh Tokens)

**Промпт:**

```
В backend/ создай auth модуль.

1. Расширь Prisma schema: добавь модели RefreshToken (id, userId, hashedToken, expiresAt, createdAt, revokedAt?) и EmailVerificationToken (id, userId, token, expiresAt). К User добавь поля: name, role (enum: STUDENT/INSTRUCTOR/ADMIN), avatarUrl?, emailVerified, passwordHash. Запусти миграцию.

2. src/modules/auth/:
   - auth.module.ts (JwtModule, PassportModule)
   - auth.controller.ts:
     - POST /auth/register — body: { email, password, name, role } → создаёт user, шлёт verify email, возвращает access+refresh
     - POST /auth/login — body: { email, password } → возвращает access+refresh + user
     - POST /auth/refresh — body: { refreshToken } → новый access+refresh (rotate)
     - POST /auth/logout — revoke refresh token
     - POST /auth/forgot-password — body: { email } → шлёт reset email
     - POST /auth/reset-password — body: { token, newPassword }
     - GET /auth/verify-email?token=... → подтверждает email
     - POST /auth/resend-verification — body: { email }
     - GET /auth/me — protected, возвращает текущего user
   - auth.service.ts: bcrypt hash (12 rounds), JWT signing (access 15min, refresh 7 days), token rotation.
   - dto/: RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto (с class-validator декораторами).
   - strategies/jwt.strategy.ts (passport-jwt, читает Bearer token).

3. src/common/guards/jwt-auth.guard.ts — defaults guard для protected роутов.
4. src/common/decorators/current-user.decorator.ts — @CurrentUser() для получения user из request.
5. src/common/decorators/public.decorator.ts — @Public() для исключения роутов из глобального guard.

6. Подключи nodemailer + Resend. Создай EmailService с методами sendVerificationEmail(), sendPasswordResetEmail(). Шаблоны HTML — простые inline templates с текстом на узбекском.

7. Глобальный JwtAuthGuard зарегистрируй в AppModule с @Public() декоратором для исключений.

8. Добавь rate limiting на /auth/login и /auth/register (5 в минуту по IP).

9. Напиши e2e тесты для основных кейсов (register → login → me → refresh → logout).

Сделай README.md в backend/src/modules/auth/ с описанием flow.
```

**Verify:** все эндпоинты работают через curl/Postman, email приходит через Resend (или хотя бы залогирован), JWT decode'ится корректно, refresh rotation работает.

---

## Шаг 11. Google OAuth + интеграция Frontend с реальным Auth

**Промпт:**

```
1. Backend: добавь Google OAuth.
   - src/modules/auth/strategies/google.strategy.ts (passport-google-oauth20).
   - GET /auth/google → редирект на Google consent.
   - GET /auth/google/callback → находит/создаёт user по email, возвращает access+refresh через redirect query params на frontend URL (FRONTEND_URL/auth/callback?accessToken=...&refreshToken=...).
   - Если у user уже есть аккаунт с этим email но он зареган через email/password — link Google к существующему user.

2. Frontend:
   - src/app/(auth)/callback/page.tsx — читает access/refresh из URL, сохраняет в httpOnly cookies (через server action или next API route), редиректит на /dashboard.
   - src/lib/api-client.ts: создай axios instance с baseURL backend, interceptor который автоматически refresh'ит токен на 401 и retry'ит запрос (защити от infinite loop через single-flight). Добавь Bearer auth header из cookies.
   - src/features/auth/api.ts: переписывай моки в реальные API calls (signIn → POST /auth/login, signUp → POST /auth/register, etc).
   - src/features/auth/hooks.ts: useAuth() хук на основе React Query (queryKey ['me'], fetch GET /auth/me). Use mutation для login/logout/register.
   - Обнови zustand store: храни только UI state, source of truth для user = React Query.
   - Обнови src/middleware.ts: проверяй наличие accessToken cookie (или используй getServerSession-like подход через парсинг cookie).

3. Создай src/components/auth/protected-route.tsx — HOC или wrapper, который проверяет role и редиректит если нет доступа. Используй для /ustoz/* (только INSTRUCTOR/ADMIN) и /admin/* (только ADMIN).

4. На /kirish и /royxatdan-otish: кнопка "Google bilan kirish" теперь делает window.location.href = `${API_URL}/auth/google`.

5. На public header'е: показывай avatar+dropdown если user залогинен (с пунктами Dashboard, Sozlamalar, Chiqish), иначе кнопки Kirish/Ro'yxatdan o'tish.

Тестовый flow: register на frontend → email приходит → verify по ссылке → login → видишь avatar в header'е → logout. Google OAuth flow: click Google → consent → возврат → залогинен.
```

**Verify:** полный auth flow работает E2E, Google OAuth работает, refresh rotation работает на frontend при 401.

---

## Шаг 12. Role-based protected routes + Account Settings

**Промпт:**

```
1. Backend: добавь RolesGuard и @Roles() декоратор. Используй для маркировки эндпоинтов которые требуют конкретной роли.

2. Frontend:
   - Layout-level guards: src/app/(student)/layout.tsx — должен использовать RoleGate(['STUDENT', 'INSTRUCTOR', 'ADMIN']). src/app/(instructor)/layout.tsx → ['INSTRUCTOR', 'ADMIN']. src/app/(admin)/layout.tsx → ['ADMIN']. Все три — пока пустые layout placeholder'ы с одной страницей "Hello [role]".
   - При неавторизованном доступе → redirect на /kirish?from=...
   - При недостатке прав → 403 страница "Sizda ruxsat yo'q".

3. Frontend src/app/(student)/sozlamalar/page.tsx (Profile Settings):
   - Tabs: "Profil" / "Hisob" / "Bildirishnomalar" / "Maxfiylik"
   - Profil tab: avatar upload (Mux/Cloudflare позже, пока — base64 в state + PUT /users/me/avatar), name, bio, social links.
   - Hisob tab: change email (с verification), change password (требует old password).
   - Bildirishnomalar tab: toggles для email уведомлений.
   - Maxfiylik tab: delete account (с confirmation dialog).

4. Backend: src/modules/users/ модуль с эндпоинтами:
   - GET /users/me (уже есть через /auth/me, можно alias)
   - PATCH /users/me (name, bio, avatarUrl)
   - PATCH /users/me/password (oldPassword, newPassword)
   - DELETE /users/me

5. На frontend Header добавь полноценный dropdown с user info, role badge, навигацией.

После этого шага: 3 ролевые зоны защищены, базовый профиль управляется.
```

**Verify:** student → /ustoz даёт 403, можно редактировать профиль, смена пароля работает с verification.

---

# STAGE 3 — DATABASE + CORE BACKEND (Шаги 13–15)

## Шаг 13. Полная Prisma schema

**Промпт:**

```
В backend/prisma/schema.prisma создай полную доменную модель. Используй существующие User и аутентификационные модели и добавь:

- Category (id, slug, name, description, iconName, sortOrder, coursesCount denormalized)
- Course (id, slug, title, subtitle, description, longDescription, thumbnailUrl, previewVideoUrl?, instructorId FK User, categoryId FK Category, level enum (BEGINNER/INTERMEDIATE/ADVANCED), language enum (UZ/RU/EN), priceUsdCents Int (0 = free), discountUsdCents?, durationMinutes Int, lessonsCount Int, studentsCount Int, ratingAvg Decimal, ratingCount Int, status enum (DRAFT/PENDING_REVIEW/PUBLISHED/REJECTED/ARCHIVED), learningOutcomes String[], requirements String[], publishedAt?, createdAt, updatedAt)
- Section (id, courseId FK, title, order, lessonsCount, durationMinutes)
- Lesson (id, sectionId FK, title, description, order, type enum (VIDEO/ARTICLE/QUIZ/CODING), videoAssetId? (Mux), articleContent? (markdown), durationSeconds, isPreview, resources Json — array of {name, url})
- Quiz (id, lessonId FK unique, passingScore, attemptsAllowed)
- Question (id, quizId FK, type enum (SINGLE/MULTIPLE/TEXT), text, options Json — array of {id, text}, correctAnswerIds String[], order)
- QuizAttempt (id, userId, quizId, score, answers Json, passedAt?, createdAt)
- CodingExercise (id, lessonId FK unique, language enum (JS/TS/PYTHON/etc), starterCode, solutionCode, tests Json — array of {input, expectedOutput})
- CodingSubmission (id, userId, exerciseId, code, passed, output, createdAt)
- Enrollment (id, userId, courseId, enrolledAt, completedAt?, certificateId?, unique(userId, courseId))
- LessonProgress (id, userId, lessonId, completedAt, lastPositionSeconds, unique(userId, lessonId))
- Note (id, userId, lessonId, content, timestampSeconds?, createdAt, updatedAt)
- Review (id, userId, courseId, rating Int 1-5, comment Text, createdAt, updatedAt, unique(userId, courseId))
- Question (Q&A) (id, userId, courseId, lessonId?, title, body, resolvedAt?, createdAt)
- Answer (id, questionId, userId, body, isInstructorAnswer Bool, createdAt)
- Certificate (id, userId, courseId, issuedAt, certificateNumber unique, pdfUrl?)
- Wishlist (id, userId, courseId, addedAt, unique(userId, courseId))
- Favorite (id, userId, courseId, addedAt, unique(userId, courseId)) — или объединить с Wishlist
- Order (id, userId, totalUsdCents, status enum (PENDING/PAID/FAILED/REFUNDED), paymentMethod enum (PAYME/CLICK/UZUM), externalPaymentId?, paidAt?, refundedAt?, createdAt)
- OrderItem (id, orderId, courseId, priceUsdCents)
- Payment (id, orderId, provider enum, status, rawPayload Json, createdAt, updatedAt)
- Notification (id, userId, type, title, body, link?, readAt?, createdAt)
- InstructorApplication (id, userId unique, status enum (PENDING/APPROVED/REJECTED), bio, expertise, sampleWorkUrls Json, rejectedReason?, decidedAt?, decidedById?, createdAt)
- BlogPost (id, slug unique, authorId, title, excerpt, content (markdown), coverImageUrl?, categoryId?, status enum (DRAFT/PUBLISHED), publishedAt?, createdAt, updatedAt)
- Comment (id, blogPostId? OR lessonId? — polymorphic, userId, body, parentId? (для тредов), createdAt, updatedAt)
- Achievement (id, code unique, title, description, iconName)
- UserAchievement (id, userId, achievementId, earnedAt, unique(userId, achievementId))

Индексы: на все FK, на slug fields, на enrollment(userId, courseId), на lessonProgress(userId, lessonId).

Создай seed.ts (prisma/seed.ts): 1 admin user, 5 instructors, 50 students, 8 категорий, 30 курсов (с секциями и уроками), 100 enrollment'ов с разным progress'ом, 200 reviews, 10 achievements. Используй faker-js. Регистрируй в package.json prisma.seed.

Запусти миграцию + seed. Покажи мне финальный schema.prisma и список таблиц.
```

**Verify:** миграция прошла, seed заполнил БД, можно открыть Supabase dashboard и увидеть таблицы с данными.

---

## Шаг 14. Backend Courses + Categories API

**Промпт:**

```
В backend создай Courses и Categories модули.

1. src/modules/categories/:
   - GET /categories — все категории.
   - GET /categories/:slug — категория + связанные курсы (paginated).

2. src/modules/courses/:
   - GET /courses — query params: search, categorySlug, level[], language[], minPrice, maxPrice, minRating, minDuration, maxDuration, sort (popular|new|rating|price-asc|price-desc), page, limit. Возвращает { items, total, page, limit }.
   - GET /courses/featured — топ-N по studentsCount или ratingAvg.
   - GET /courses/:slug — полный курс + sections + lessons (без videoAssetId для незаписавшихся) + instructor (public fields) + reviews (paginated).
   - GET /courses/:slug/reviews — paginated.
   - POST /courses/:slug/reviews — protected, только enrolled, body: { rating, comment }.
   - GET /instructors — paginated с фильтрами, sort.
   - GET /instructors/:username — публичный профиль + опубликованные курсы.

Только PUBLISHED курсы возвращаются в public эндпоинтах. Все мутации создающие/обновляющие курсы — в шаге 28+ (Instructor Panel).

Используй DTO + class-validator. Возвращай pagination в формате { items, meta: { total, page, limit, totalPages } }.

Кеширование: GET /categories — 1 час в memory cache (NestJS @CacheKey + CacheTTL). GET /courses/featured — 5 минут.

Добавь Swagger через @nestjs/swagger: /api/docs.

Напиши e2e тесты для основных GET эндпоинтов с проверкой что seed данные возвращаются корректно.
```

**Verify:** /api/docs показывает все эндпоинты, GET /courses?search=react возвращает релевантные, GET /courses/:slug возвращает полный курс с секциями.

---

## Шаг 15. Frontend интеграция: replace mocks → real API

**Промпт:**

```
В frontend замени mock-данные на реальные API calls для public website.

1. src/lib/api-client.ts (axios instance уже создан в шаге 11) — добавь типизированные клиенты:
   - src/features/courses/api.ts: fetchCourses(filters), fetchCourseBySlug(slug), fetchFeaturedCourses(), fetchReviews(slug, page).
   - src/features/categories/api.ts: fetchCategories(), fetchCategoryBySlug(slug).
   - src/features/instructors/api.ts: fetchInstructors(filters), fetchInstructorByUsername(username).

2. Используй React Query повсюду:
   - src/features/courses/hooks.ts: useCourses(filters), useCourse(slug), useFeaturedCourses(), useReviews(slug).
   - Аналогично для categories, instructors.
   - queryKeys в src/lib/query-keys.ts для type-safe ключей.

3. На главной (page.tsx) — useFeaturedCourses() для секции featured, useCategories() для популярных, и т.д.

4. На /kurslar — useCourses(filters) с filters из URL params. Server-side first fetch через Next.js fetch на server component, потом React Query hydrate на клиенте.

5. На /kurslar/[slug] — useCourse(slug). Если 404 — call notFound() из next/navigation.

6. Аналогично для /kategoriyalar/[slug] и /ustozlar/[username].

7. Установи React Query Devtools (dev only).

8. Создай типы в src/types/api.ts (zod схемы для validate responses + inferType). Используй для безопасности.

9. Обработай ошибки: error boundary, fallback UI, retry.

10. Удали src/mocks/*.ts (если не используются больше).

Тестовый flow: с пустым localStorage заходишь на главную → видишь реальные курсы из БД (из seed). Поиск по /kurslar?search=react возвращает реальные совпадения. Открытие /kurslar/{slug} показывает курс из БД.
```

**Verify:** все public страницы работают на реальных данных, фильтры реально работают через API, React Query кэширует, loading skeletons работают.

---

# STAGE 4 — STUDENT PANEL (Шаги 16–18)

## Шаг 16. Student Dashboard layout + Dashboard page

**Промпт:**

```
В frontend создай Student Panel с собственным sidebar layout'ом (по образцу design-system/project/ui_kits/web/Chrome.jsx — тёмный вертикальный rail слева 240-280px + topbar с search/bell/profile).

1. src/app/(student)/layout.tsx:
   - StudentSidebar (фиксированный левый, тёмный фон ilm-ink, белые иконки Lucide + текст). Пункты: Bosh sahifa (home), Mening kurslarim (book-open), Sevimlilar (heart), Sertifikatlar (award), Yutuqlar (medal), Sozlamalar (settings). Кнопка collapse.
   - StudentTopbar: search (глобальный поиск курсов), bell (notifications dropdown), avatar dropdown (Profil, Sozlamalar, Chiqish).
   - Main: max-w-7xl, padding 32px.
   - Mobile: sidebar превращается в Sheet (toggle через hamburger в topbar).

2. src/app/(student)/dashboard/page.tsx — Dashboard (используй Home.jsx из design-system как референс):
   - Welcome card: "Salom, {name} 👋" (без emoji — заменить на Mascot 80px), стрик дней обучения, "Bugun {минут} minut o'rganildi".
   - "Davom etish" — последний просмотренный урок (large card с thumbnail + progress + кнопка "Davom etish").
   - "Jarayondagi kurslar" grid: enrollment'ы с progress < 100%, по 3-6 карточек.
   - "Haftalik o'qish" — line chart (recharts) часов в день за последние 7 дней.
   - "Yutuqlar" — последние 3 заработанных achievement'а.
   - "Tavsiya etiladi" — 4 курса (рекомендации по категории).
   - Premium upsell card (по образцу из design-system Example 2): "IlmHub Pro — barcha kurslarga kirish" + Mascot + кнопка "Sotib olish".

3. Backend: добавь GET /me/dashboard эндпоинт который возвращает { user, currentLesson, inProgressCourses, weeklyHours, recentAchievements, recommendedCourses }.

4. Notifications dropdown в topbar: GET /me/notifications, mark as read (PATCH), bell icon с красной точкой если есть unread.

5. Используй framer-motion для появления карточек с stagger.

Все на узбекском.
```

**Verify:** /dashboard доступен только залогиненным, sidebar работает, dashboard показывает реальные данные пользователя.

---

## Шаг 17. My Courses + Favorites + Wishlist

**Промпт:**

```
1. src/app/(student)/mening-kurslarim/page.tsx — список курсов на которые я записан:
   - Tabs: "Hammasi" / "Jarayonda" / "Tugatildi" / "Boshlanmagan".
   - Grid карточек: thumbnail, title, instructor, progress bar (0-100%), кнопка "Davom etish" / "Boshlash" / "Yana ko'rib chiqish".
   - Sort: oxirgi kirish / yangi yozildim / progress.
   - Empty state с Mascot и кнопкой "Kurslarni ko'rish".
   - Backend: GET /me/enrollments?status=&sort=.

2. src/app/(student)/sevimlilar/page.tsx — Favorites/Wishlist (объедини в одну сущность):
   - Grid обычных CourseCard, но с heart-filled иконкой в углу.
   - Кнопка "Sotib olish" на каждой карточке (или "Bepul ro'yxatdan o'ting" если бесплатный).
   - Backend: GET /me/favorites, POST /favorites/:courseId, DELETE /favorites/:courseId.

3. На public CourseCard и Course Details: добавь heart toggle (требует auth — если не залогинен, click → редирект на /kirish).

4. Создай универсальный <CourseCard variant="public" | "enrolled" | "favorite" /> компонент с условным рендером CTA и оверлеев.

5. Backend модули:
   - src/modules/enrollments/ с эндпоинтами enroll (POST /enrollments — будет использоваться после оплаты в шаге 24), GET /me/enrollments.
   - src/modules/favorites/.

6. React Query: useEnrollments(), useFavorites(), useToggleFavorite() mutation с optimistic update.
```

**Verify:** записываешь курс через seed (или мини-кнопка "Test enroll" пока без оплаты — затем удалим в шаге 24), он появляется в "Mening kurslarim", добавляешь в избранное — heart заливается.

---

## Шаг 18. Сертификаты + Достижения + Профиль (UI завершение)

**Промпт:**

```
1. src/app/(student)/sertifikatlar/page.tsx (по образцу design-system/project/ui_kits/web/Certificates.jsx):
   - Grid сертификатов: каждый — card с фото курса, названием, датой выдачи, certificate number, кнопками "Yuklab olish" (download PDF) и "Ulashish" (share — link copy / LinkedIn / Telegram).
   - Empty state если нет.
   - Backend: GET /me/certificates. Эндпоинт POST /certificates/:id/download — генерирует PDF (используй puppeteer или pdfkit; пока можно вернуть placeholder PDF из public/sample-certificate.pdf). Реальная генерация и сертификат-template — в шаге 40.

2. src/app/(student)/yutuqlar/page.tsx (Achievements):
   - Grid badge'ей: заработанные (цветные) и заблокированные (greyscale + locked icon).
   - Каждый badge: иконка Lucide или custom SVG в круге, название, описание, дата получения.
   - Категории: "Boshlanish" / "Davomiy" / "Tugatish" / "Sotsial".
   - Progress: "X / Y yutuq".
   - Backend: GET /me/achievements (все achievements + флаг earned).

3. Завершение Settings (из шага 12) — добавь все табы если не было:
   - "Maxfiylik": data export (GDPR), delete account.
   - "Bildirishnomalar": email preferences (новые курсы, ответы на Q&A, promo, и т.д.).
   - "Til" tab: dropdown Uzbek/Russian/English (UI только, реальный i18n в шаге 36).

4. На /dashboard, /mening-kurslarim, /sevimlilar добавь skeleton'ы при загрузке (используй shadcn Skeleton).

5. Добавь Notifications page src/app/(student)/bildirishnomalar/page.tsx — список всех уведомлений, mark all as read, group by date.
```

**Verify:** все student-страницы работают на реальных данных, navigation между ними плавная, нет TS ошибок.

---

# STAGE 5 — LEARNING SYSTEM (Шаги 19–23)

## Шаг 19. Lesson Player — Video player + Mux/Cloudflare интеграция

**Промпт:**

```
В этом шаге сделаем минимально работающий Lesson Player с реальным видео.

Решение по видео: используем **Mux** (проще для начала, лучше API). Можно потом сменить.

1. Backend: добавь Mux SDK (@mux/mux-node):
   - MuxService с методами: createUploadUrl() (для instructor upload в шаге 30), createPlaybackToken(assetId, userId) (signed URL для просмотра).
   - Эндпоинт POST /lessons/:id/playback-token — protected, возвращает { playbackId, token, expiresAt }. Проверка: user должен быть enrolled в курс этого урока (или это preview-урок).

2. Frontend: установи @mux/mux-player-react. Создай src/features/learning/components/video-player.tsx — обёртка над <MuxPlayer> с:
   - Просьба к API playback-token перед рендером (через React Query).
   - События: onTimeUpdate (every 5s — отправлять прогресс), onEnded (mark lesson complete).
   - Контроль скорости 0.5x/1x/1.25x/1.5x/2x.
   - Picture-in-picture, fullscreen, captions toggle.
   - Resume from last position (из enrollment progress).

3. src/app/(learning)/dars/[lessonId]/page.tsx — Lesson Player page (по образцу design-system/project/ui_kits/web/LessonPlayer.jsx):
   - Layout: header (back to course, course title, progress %), main grid (video + tabs слева 70%, lessons sidebar справа 30%).
   - Video player сверху.
   - Под видео: lesson title, instructor, кнопки "Tugatdim" / "Eslatma qo'shish".
   - Tabs: "Tavsif" (lesson description), "Eslatmalar" (notes — следующий шаг), "Savol-Javob" (Q&A — шаг 22), "Resurslar" (downloads).
   - Sidebar: список секций + уроков, текущий highlighted, completed → check icon, locked → lock icon.

4. (learning) route group — отдельный layout без public/student sidebar — только learning chrome.

5. Backend: POST /lessons/:id/progress — body: { positionSeconds, completed }. Обновляет LessonProgress + Enrollment.progress. Если completed=true и это последний урок — issue certificate (placeholder) + create achievement.

6. Для seed: добавь несколько реальных уроков с public Mux playback IDs (есть бесплатные test videos в Mux docs) или с тестовыми URL.

Создай enrollment flow стартового шага: на CourseDetails для free курса кнопка "Bepul boshlash" → POST /enrollments → redirect на первый урок. Платные курсы — кнопка "Sotib olish" заблокирована до шага 24.
```

**Verify:** записываешься на free курс → попадаешь на /dars/{lessonId} → видео играет → progress сохраняется (проверь в БД) → можно переключаться между уроками через sidebar.

---

## Шаг 20. Lessons sidebar + Mark complete + Resume + Progress

**Промпт:**

```
В шаге 19 базовый sidebar и mark complete уже сделаны. В этом шаге — полировка и доп. функционал.

1. Sidebar:
   - Accordion с секциями, каждая раскрыта по умолчанию.
   - В каждой секции: список уроков с иконкой типа (play-circle / file-text / help-circle для quiz / terminal для coding), длительностью, иконкой completed (check-circle filled).
   - Прогресс секции "3/8 tugatildi" в заголовке секции.
   - Текущий урок: выделен ilm-surface фоном + полоской слева.
   - Заблокированные (если course требует sequential prereqs — пока все доступны).

2. Mark complete:
   - Кнопка "Tugatdim" под видео (toggle): если completed → "Tugatildi ✓".
   - Auto-complete при просмотре >90% видео (через onTimeUpdate).
   - После complete → toast "Yaxshi ish!" + auto-advance к следующему уроку (с 3-секундным countdown overlay "Keyingi dars: ..." + кнопка "Bekor qilish").

3. Progress tracking:
   - Header показывает overall progress курса как пилюлю "{X}% tugatildi" + bar.
   - При завершении всех уроков → confetti animation (canvas-confetti, единичное разовое исключение из правила "никакого confetti") + modal "Tabriklaymiz, kursni tugatdingiz!" с кнопкой view certificate.

4. Resume:
   - При входе на /dars/[lessonId] видео автоматически перематывается на lastPositionSeconds.
   - На /kurslar/[slug] для enrolled user — кнопка "Davom etish: '{lessonTitle}'" вместо "Sotib olish".

5. Keyboard shortcuts:
   - Space — play/pause
   - F — fullscreen
   - ←/→ — seek 5s
   - M — mute
   - C — toggle captions
   - N — next lesson
   - P — previous lesson

6. Mobile: sidebar становится bottom-sheet (toggle).
```

**Verify:** прогресс реально считается, auto-advance работает, completion modal появляется на 100%, resume работает после перезагрузки страницы.

---

## Шаг 21. Notes system

**Промпт:**

```
Notes — личные заметки студента к урокам, опционально привязанные к timestamp видео.

1. Backend модуль src/modules/notes/:
   - POST /notes — body: { lessonId, content, timestampSeconds? }
   - GET /notes?lessonId=&courseId= — мои заметки.
   - PATCH /notes/:id
   - DELETE /notes/:id

2. Frontend src/features/learning/components/notes-panel.tsx — tab в Lesson Player:
   - Кнопка "Eslatma qo'shish" — открывает rich-text editor (используй Tiptap с базовыми extensions: bold, italic, link, list).
   - Опция "{X:YY} vaqtga bog'lash" — checkbox, по умолчанию заполнен текущим timestamp video.
   - При сохранении → POST /notes, в списке появляется карточка.
   - Каждая карточка note: timestamp (если есть, как pill clickable → seek video), content (rendered markdown/html), edit/delete.
   - Sort by timestamp asc / created desc.
   - Search по содержимому.
   - Export notes as Markdown (button download).

3. На странице /mening-kurslarim/{enrollmentId}/eslatmalar (или на course details для enrolled) — все мои заметки по этому курсу, сгруппированные по урокам.

4. Используй React Query optimistic updates для мгновенного UI.

5. Auto-save: при редактировании debounce 1s → PATCH.
```

**Verify:** создаёшь заметку с timestamp → видишь в списке → click на timestamp перематывает видео → edit/delete работают.

---

## Шаг 22. Q&A система

**Промпт:**

```
Q&A — публичный раздел вопросов и ответов под каждым курсом / уроком. Студенты задают, инструктор и другие студенты отвечают.

1. Backend src/modules/qa/:
   - POST /questions — body: { courseId, lessonId?, title, body } (protected, enrolled only).
   - GET /questions?courseId=&lessonId=&sort=newest|popular|unresolved — paginated.
   - GET /questions/:id — вопрос + все ответы (threaded).
   - POST /questions/:id/answers — body: { body }.
   - PATCH /questions/:id/resolve — только автор вопроса или instructor.
   - POST /answers/:id/vote — body: { direction: 1 | -1 }. Кешируй votesCount на answer.
   - DELETE — soft delete.

2. Frontend:
   - Tab "Savol-Javob" в Lesson Player.
   - На странице курса /kurslar/[slug] — отдельный таб "Savollar".
   - Список вопросов: title, превью body, автор + avatar, ответов count, последняя активность, теги (resolved / instructor-answered).
   - Раскрытие → полный вопрос + threaded ответы. У ответов от инструктора — pill "Ustoz".
   - Форма "Yangi savol berish" (modal или inline).
   - Filter: all / unresolved / my questions / instructor-answered.

3. Notifications: при ответе на твой вопрос — push в /me/notifications.

4. Markdown поддержка в body (через react-markdown + remark-gfm). Без HTML.
```

**Verify:** задаёшь вопрос → видишь в списке → отвечаешь от другого аккаунта → автор получает notification → можно пометить resolved.

---

## Шаг 23. Quizzes

**Промпт:**

```
Quizzes — викторины как тип урока. Single/Multiple choice + текстовые ответы.

1. Backend src/modules/quizzes/:
   - GET /lessons/:lessonId/quiz — возвращает quiz + questions (без correctAnswerIds).
   - POST /quizzes/:id/attempts — body: { answers: [{ questionId, selectedOptionIds, textAnswer? }] }. Возвращает score + which were correct/wrong (только если passingScore достигнут или attemptsAllowed = unlimited).
   - GET /me/quizzes/:id/attempts — мои попытки.

2. Frontend src/app/(learning)/dars/[lessonId]/page.tsx:
   - Если lesson.type === 'QUIZ' — не video player, а quiz UI.
   - Quiz UI:
     - Intro screen: title, описание, "Bu testda {N} ta savol bor. O'tish uchun {%} kerak. {N} ta urinish".
     - Progress: "Savol {X} / {Y}" + bar.
     - One question at a time: текст, варианты ответов (radio для single, checkbox для multiple, textarea для text).
     - Navigation: Orqaga / Keyingi / Tugatish.
     - Submit → result screen: score, passed/failed (зелёный/красный), breakdown по каждому вопросу (правильно/неправильно + правильный ответ + объяснение если есть), кнопка "Yana urinib ko'rish" (если attempts remaining) или "Keyingi darsga o'tish".
   - Анимации: smooth slide между вопросами.

3. Backend: на progress endpoint — если quiz passed, mark lesson complete.

4. Insturctor quiz builder — отложен на шаг 30 (Course Creation Flow).

Создай seed quiz с 5 вопросами для одного урока.
```

**Verify:** проходишь quiz → получаешь результат → видишь breakdown → ретрай работает, прошедший quiz mark'ает урок как complete.

---

# STAGE 6 — ENROLLMENT + PAYMENTS (Шаги 24–27)

## Шаг 24. Enrollment flow для платных курсов + Order скелет

**Промпт:**

```
До этого free курсы можно было instant-enroll. Сейчас сделаем платную ветку.

1. Backend:
   - POST /orders — body: { courseIds: string[], paymentMethod: 'PAYME' | 'CLICK' | 'UZUM' }. Создаёт Order со status=PENDING и OrderItem'ами. Возвращает { orderId, paymentUrl } (paymentUrl пока mock).
   - GET /orders/:id — детали ордера, статус.
   - GET /me/orders — мои заказы paginated.

2. Frontend:
   - На Course Details кнопка "Sotib olish" → /checkout?courseId=...
   - src/app/(checkout)/checkout/page.tsx:
     - Cart-like UI: список курсов с thumbnail, title, instructor, ценой; total внизу.
     - Promo code input (пока без логики, готовь поле).
     - Payment method selector: радио Payme / Click / Uzum, с логотипами.
     - Кнопка "To'lash" → POST /orders → redirect на paymentUrl (в моке - на /checkout/success?orderId=...).
   - src/app/(checkout)/checkout/success/page.tsx: confirmation, list of courses, кнопка "O'qishni boshlash" (enroll и идти на первый урок).
   - src/app/(checkout)/checkout/failed/page.tsx: error + кнопка retry.

3. Webhook handler /webhooks/payments/:provider — пока mock endpoint, который для тестов можно дёрнуть curl'ом и он симулирует подтверждение. Логика: marks Order.status = PAID, paidAt = now, и создаёт Enrollment для каждого OrderItem. Также шлёт email-подтверждение.

4. В шаге 25-27 заменим mock на реальные интеграции.

5. На /mening-kurslarim после mock-confirmation должен появиться enrolled курс.

6. Корзина и multi-course checkout — добавь Zustand store cartStore с add/remove/clear. Header показывает badge с count.
```

**Verify:** Click "Sotib olish" → checkout → mock paid → enroll → курс в "Mening kurslarim".

---

## Шаг 25. Payme интеграция

**Промпт:**

```
Payme имеет специфичный flow с server-to-server callback'ами (CheckPerformTransaction, CreateTransaction, PerformTransaction, CancelTransaction, CheckTransaction, GetStatement). Документация: https://developer.help.paycom.uz

1. Backend src/modules/payments/payme/:
   - PaymeController:
     - POST /webhooks/payments/payme — single endpoint для всех Payme methods (JSON-RPC style). Авторизация: Basic auth с PAYME_MERCHANT_KEY.
     - Implement methods: CheckPerformTransaction, CreateTransaction, PerformTransaction, CancelTransaction, CheckTransaction.
   - PaymeService — бизнес-логика для каждого метода (проверки, обновление Order/Payment).

2. Создание платежа со стороны frontend:
   - Backend POST /orders теперь для PAYME возвращает paymentUrl формата `https://checkout.paycom.uz/{base64({m: merchantId, ac: {order_id: ...}, a: amountInTiyin})}` (или используй редирект-форму).
   - Frontend перенаправляет browser на этот URL.

3. После успешного платежа Payme редиректит user обратно (return URL) → /checkout/success?orderId=...

4. Test mode: используй Payme sandbox с тестовыми merchant credentials. Опиши в README backend'а как настроить.

5. Логирование: каждый webhook → структурированный лог + сохранение rawPayload в Payment.rawPayload для аудита.

6. Idempotency: PerformTransaction может прийти несколько раз — проверяй is_performed.

7. Реальные конкретные значения суммы (Payme работает в тийинах = USD * 100 * exchange_rate, или приводи цену курса к UZS перед отправкой).

Спроси меня про PAYME_MERCHANT_ID и PAYME_MERCHANT_KEY перед началом — без них только sandbox.

Напиши e2e тест который симулирует все стадии Payme transaction.
```

**Verify:** тестовый платёж через Payme sandbox проходит → курс автоматически записывается через webhook.

---

## Шаг 26. Click интеграция

**Промпт:**

```
Click имеет более простой flow чем Payme: redirect + webhook prepare/complete.

1. Backend src/modules/payments/click/:
   - ClickController:
     - POST /webhooks/payments/click/prepare — Click шлёт перед списанием, проверяем что Order existing и amount матчится.
     - POST /webhooks/payments/click/complete — Click подтверждает списание.
   - Авторизация: SHA1 hash с CLICK_SECRET_KEY.

2. Backend POST /orders для CLICK возвращает paymentUrl формата `https://my.click.uz/services/pay?service_id=...&merchant_id=...&amount=...&transaction_param=ORDER_ID&return_url=...`.

3. Аналогично Payme: idempotency, logging, sandbox test.

4. Спроси меня про CLICK_MERCHANT_ID, CLICK_SERVICE_ID, CLICK_SECRET_KEY перед началом.

Документация: https://docs.click.uz
```

**Verify:** тестовый платёж через Click sandbox проходит.

---

## Шаг 27. Uzum + final payments polish

**Промпт:**

```
1. Backend src/modules/payments/uzum/ — аналогично Payme/Click, по docs.uzum.uz (или Apelsin gateway зависит от их актуального API).

2. Refunds:
   - PATCH /admin/orders/:id/refund — body: { reason } — initiates refund через соответствующий gateway.
   - Backend logic: revoke enrollment (если progress < 30% можно auto, иначе manual review).
   - Frontend on /me/orders: кнопка "Pulni qaytarish" (если в течение 7 дней и progress < 30%).
   - Admin UI для approve/reject refunds → шаг 34.

3. Email notifications:
   - Order confirmation на email после успешной оплаты.
   - Receipt с деталями заказа, ссылками на курсы.
   - Refund confirmation.

4. Invoice/receipt: PDF generation (puppeteer или pdf-lib) — простой template на узбекском с реквизитами IlmHub LLC, INN, amount, courses list, date.

5. Backend cron job (через bullmq scheduled): каждые 10 минут проверяет PENDING orders > 1 час → mark FAILED, освобождает любые reserved ресурсы (никаких, так что просто mark).

6. Frontend:
   - /me/orders с фильтрами по статусу.
   - Каждый order — карточка с list of courses, total, status pill, кнопки "Pulni qaytarish" / "Yana sotib olish" / "Hisob varaqasi".
   - На checkout: если auth user не залогинен — потребуй login first.
   - Multi-currency display: цены в USD основной, отображение конвертированное в UZS под спойлером.

Если у тебя нет Uzum credentials — placeholder gateway с тестовым flow, реальные wire'ы потом.
```

**Verify:** полный цикл оплаты любым из 3 методов работает, refund flow работает (admin может одобрить).

---

# STAGE 7 — INSTRUCTOR PANEL (Шаги 28–31)

## Шаг 28. Instructor Dashboard + Apply to be instructor

**Промпт:**

```
1. Apply-to-be-instructor flow:
   - На public footer / в Student panel — кнопка "Ustoz bo'lish".
   - src/app/(student)/ustoz-bolish/page.tsx — application form:
     - Bio (textarea), expertise areas (multi-select из categories), social links, sample work URLs (portfolio, прошлые видео и т.п.).
     - Submit → POST /instructor-applications → status PENDING.
     - После submit — статус-страница "Arizangiz ko'rib chiqilmoqda".
   - Backend модуль src/modules/instructor-applications/.

2. Admin сторона (placeholder): GET /admin/instructor-applications, PATCH /admin/instructor-applications/:id/approve|reject → меняет user.role на INSTRUCTOR + notification. Полный UI в шаге 33.

3. Instructor Panel layout src/app/(instructor)/layout.tsx:
   - Аналогично student layout, но с другими sidebar пунктами: Bosh sahifa (home), Mening kurslarim (book-open), Talabalar (users), Sharhlar (star), Daromad (dollar-sign), Aloqalar (message-square), Sozlamalar.
   - RoleGate: только INSTRUCTOR или ADMIN.

4. src/app/(instructor)/dashboard/page.tsx — Instructor Dashboard:
   - Stats grid: jami talabalar, jami daromad (этот месяц / всё время), reyting, sotuvlar (этой недели).
   - Sales chart: line chart за последние 30 дней.
   - Recent enrollments: список последних N студентов с их курсами.
   - Pending reviews: новые отзывы требующие ответа.
   - Pending Q&A: вопросы без ответа.
   - CTA: "Yangi kurs yaratish" → /ustoz/kurslar/yangi.

5. Backend: эндпоинт GET /instructor/dashboard — агрегированные данные.
```

**Verify:** student апплаится → admin (manually через DB или curl) approve'ит → role меняется на INSTRUCTOR → можно зайти на /ustoz/dashboard.

---

## Шаг 29. Course Creation Flow (Шаги 1-4: Basic info, Thumbnail, Description, Curriculum)

**Промпт:**

```
Wizard для создания курса. Сделай Stepper UI который сохраняет прогресс на backend (draft) после каждого шага.

1. Backend:
   - POST /courses/draft — создаёт пустой DRAFT course, возвращает id.
   - PATCH /courses/:id — обновление полей (используй для каждого шага).
   - DELETE /courses/:id — удалить draft.
   - GET /me/courses/:id — instructor может видеть свой draft.

2. src/app/(instructor)/kurslar/yangi/page.tsx → создаёт draft → redirect на /ustoz/kurslar/{id}/tahrirlash?step=1.

3. src/app/(instructor)/kurslar/[id]/tahrirlash/page.tsx — wizard:
   - Top: Stepper показывающий 8 шагов с прогрессом + breadcrumb. Можно прыгать на пройденные шаги.
   - Step 1 (Asosiy ma'lumotlar): title, subtitle, category, level, language, price (USD).
   - Step 2 (Rasm): thumbnail upload (drag&drop), preview. Backend upload через POST /uploads/image (Multer + Sharp для resize до 1280×720 + thumbnail 640×360). Хранение: для прода — Supabase Storage или S3; для dev — локальная папка uploads/.
   - Step 3 (Tavsif): textarea description, longDescription (rich text — Tiptap), learning outcomes (list of strings, до 10), requirements (list, до 10).
   - Step 4 (Dastur — Curriculum builder):
     - Список секций (drag-drop sort через @dnd-kit).
     - В каждой секции — список уроков с типом, drag-drop.
     - "+ Bo'lim qo'shish", "+ Dars qo'shish" buttons.
     - Inline edit для названий.
     - Подсчёт totalDuration / lessonsCount автоматически.

4. Auto-save: после каждого blur поля → PATCH /courses/:id (debounce 500ms). Show "Saqlanmoqda..." / "Saqlandi ✓" indicator.

5. Validation: каждый шаг имеет свою zod схему. Не пускать на следующий шаг если invalid.

Шаги 5-8 — в следующем промпте.
```

**Verify:** instructor создаёт draft → проходит шаги 1-4 → секции и уроки сохраняются → можно вернуться и продолжить.

---

## Шаг 30. Course Creation Flow (Шаги 5-8: Upload lessons, Coding Exercises, Quizzes, Publish)

**Промпт:**

```
Продолжение wizard'а.

1. Step 5 (Darslarni yuklash — Upload lessons): для каждого VIDEO урока в curriculum'е:
   - Загрузка видео через Mux Direct Upload (создаёт upload URL на backend, frontend загружает файл напрямую в Mux).
   - Progress bar для каждого upload'а.
   - После загрузки Mux ассинхронно processing → backend webhook /webhooks/mux обновляет asset status. Показывать "Qayta ishlanyapti..." до готовности.
   - Можно ставить isPreview флаг (тогда любой пользователь может посмотреть).
   - Resources: добавить downloadable files / external links (массив).
   - Для ARTICLE урока: Tiptap editor для content.

2. Step 6 (Kod mashqlari — Coding Exercises): для каждого CODING урока:
   - Language selector (JS / TS / Python / etc).
   - Starter code (Monaco editor).
   - Solution code (Monaco editor).
   - Tests: JSON или UI builder для array of {input, expectedOutput, description}.
   - Note: для MVP execute код через изолированный sandbox — отложим в Stage 9 шаг 36. Сейчас просто save в БД.

3. Step 7 (Test savollari — Quizzes): для каждого QUIZ урока:
   - Settings: passingScore, attemptsAllowed.
   - Add questions: type (single/multiple/text), text, options (для multi), correctAnswerIds, optional explanation.
   - Drag-drop reorder.

4. Step 8 (Nashr qilish — Publish):
   - Preview: показать как будет выглядеть public course details страница.
   - Checklist: title ✓, thumbnail ✓, минимум 3 урока ✓, цена ✓, и т.д. Не дать опубликовать если не все ✓.
   - Submit for review: меняет status на PENDING_REVIEW. Admin потом одобрит → PUBLISHED.
   - Course list в /ustoz/kurslar показывает статус.

5. Backend:
   - PATCH /courses/:id/submit-for-review — переключает на PENDING_REVIEW.
   - Mux webhook handler /webhooks/mux — обновляет lesson.videoAssetId, durationSeconds после processing.

6. /ustoz/kurslar — список всех моих курсов с статусами, фильтрами, кнопкой создать новый.

7. Edit published course: можно менять non-critical поля без re-review. Изменение price / curriculum заметное → re-review.
```

**Verify:** instructor загружает реальное видео → оно processing → playable → может submit for review → admin approve → курс становится PUBLISHED → виден в public catalog.

---

## Шаг 31. Instructor: Students, Reviews, Communication, Revenue

**Промпт:**

```
1. src/app/(instructor)/talabalar/page.tsx (Students):
   - Таблица: avatar, name, email, jami kurslar, jami harajat, oxirgi faollik, action buttons (xabar yuborish, ko'rish).
   - Filter по курсу, search by name/email.
   - Click на student → details modal: which courses, progress, last login.

2. src/app/(instructor)/sharhlar/page.tsx (Reviews):
   - List of reviews across all my courses, sortable.
   - Each: stars, course, student, date, comment.
   - Reply form (textarea + submit → posts as Q&A answer или dedicated review reply).
   - Filter: ответил / не ответил / по звёздам.

3. src/app/(instructor)/aloqalar/page.tsx (Communication):
   - Inbox-like UI: список диалогов с студентами (если двусторонний messaging).
   - Каждый dialog — thread сообщений.
   - Backend: src/modules/messages/ — простой DM с conversations, messages таблицами.
   - Send announcement: к одному / нескольким / всем студентам курса (creates notification + email).

4. src/app/(instructor)/daromad/page.tsx (Revenue):
   - Stats: Этого месяца / Этого года / Всё время. Чистая выплата vs. gross (комиссия платформы 10%).
   - Chart: помесячно за год.
   - Транзакции: список всех продаж (course, student, date, amount, fee, net).
   - Payouts: history withdrawals + кнопка "Pulni yechish" (request payout).

5. Backend:
   - GET /instructor/students
   - GET /instructor/reviews
   - GET /instructor/revenue
   - GET /instructor/payouts, POST /instructor/payouts (request)
   - Messages module CRUD.
```

**Verify:** instructor видит студентов своего курса, отвечает на отзыв, запрашивает выплату.

---

# STAGE 8 — ADMIN PANEL (Шаги 32–35)

## Шаг 32. Admin Dashboard + Analytics

**Промпт:**

```
1. src/app/(admin)/layout.tsx — admin chrome:
   - Sidebar: Bosh sahifa, Foydalanuvchilar, Ustozlar, Kurslar, To'lovlar, Refundlar, Blog, CMS, Sozlamalar.
   - RoleGate: только ADMIN.

2. src/app/(admin)/dashboard/page.tsx (Admin Dashboard):
   - Top stats: jami foydalanuvchilar, jami kurslar, MRR, aktiv talabalar, kutilayotgan moderatsiyalar.
   - Charts:
     - Foydalanuvchilarning o'sishi (line chart за 30 дней).
     - Daromad (bar chart helping monthly).
     - Top kurslar (table top-10 по enrollments).
     - Top kategoriyalar (pie chart по enrollments).
   - Quick actions: модерация ожидающих курсов / ozozhidayushhix instructor applications.

3. Backend:
   - GET /admin/analytics/overview — все агрегаты для dashboard.
   - GET /admin/analytics/users-growth?period=30d
   - GET /admin/analytics/revenue?period=12m
   - GET /admin/analytics/top-courses
   - GET /admin/analytics/top-categories

4. Используй recharts для всех графиков. Стиль: монохром (черные линии, серые fills), без градиентов.
```

**Verify:** /admin/dashboard показывает реальные данные из БД (из seed).

---

## Шаг 33. User management + Instructor verification

**Промпт:**

```
1. src/app/(admin)/foydalanuvchilar/page.tsx — User management:
   - Таблица: avatar, name, email, role badge, status (active/suspended), created, last login, kurslar count, actions.
   - Bulk select + actions: suspend, change role, send email.
   - Search, filter by role/status, sort.
   - Click на user → details modal: full profile, enrolled courses, orders, audit log.
   - Actions: change role, suspend account (soft block login), unsuspend, delete (hard, с double confirm).

2. Backend src/modules/admin/users/:
   - GET /admin/users (paginated, filtered)
   - GET /admin/users/:id
   - PATCH /admin/users/:id (role, status)
   - DELETE /admin/users/:id
   - All actions logged in AuditLog таблице (создай при необходимости).

3. src/app/(admin)/ustozlar/page.tsx — Instructor management:
   - Tabs: "Tasdiqlangan" / "Kutilmoqda" / "Rad etilgan".
   - Pending applications: card view — bio, expertise, sample work links, кнопки "Tasdiqlash" / "Rad etish" (с reason).
   - Approved instructors: list with их курсами count, total students, revenue, action "Statusni o'zgartirish".

4. Backend:
   - GET /admin/instructor-applications
   - PATCH /admin/instructor-applications/:id/approve
   - PATCH /admin/instructor-applications/:id/reject (body: { reason })
   - На approve: user.role = INSTRUCTOR + welcome email.
```

**Verify:** admin банит пользователя → тот не может зайти, approve'ит instructor application → user role меняется → user получает email.

---

## Шаг 34. Course moderation + Refunds

**Промпт:**

```
1. src/app/(admin)/kurslar/page.tsx — Course moderation:
   - Tabs: "Nashr etilgan" / "Ko'rib chiqilmoqda" / "Rad etilgan" / "Arxiv" / "Hammasi".
   - Pending review табыпо умолчанию: список курсов pending PENDING_REVIEW c превью thumbnail, instructor, дата отправки.
   - Click → полная страница курса (как public details но с panel'ом slidout справа):
     - "Tasdiqlash" / "Rad etish" (with reason) / "Arxivlash".
     - Quick notes (для других admin'ов).

2. Backend:
   - GET /admin/courses?status=
   - PATCH /admin/courses/:id/approve → PUBLISHED, publishedAt = now, шлёт notification instructor'у.
   - PATCH /admin/courses/:id/reject body: { reason } → REJECTED + notification + email.
   - PATCH /admin/courses/:id/archive → ARCHIVED (скрыт из public catalog).

3. src/app/(admin)/refundlar/page.tsx — Refund management:
   - Список refund requests, статус (requested, approved, rejected, completed).
   - Каждый: order details, student, course, reason, requested date.
   - Approve → initiates refund через соответствующий gateway (используй модули из шагов 25-27).
   - Reject with reason → notification.

4. Backend:
   - GET /admin/refunds
   - PATCH /admin/refunds/:id/approve → call gateway refund + update enrollment.
   - PATCH /admin/refunds/:id/reject

5. Bulk actions: для refunds (одобрить пачкой), для course moderation.
```

**Verify:** admin одобряет PENDING course → он становится PUBLISHED → виден в каталоге. Refund одобряется → курс removed from "Mening kurslarim".

---

## Шаг 35. CMS + Blog management + Settings

**Промпт:**

```
1. Blog система (public side есть в Stage 9 шаг 37, но создадим admin сторону сейчас):
   - src/app/(admin)/blog/page.tsx — список постов с фильтрами, статусом.
   - src/app/(admin)/blog/yangi/page.tsx и /tahrirlash/[id] — редактор поста:
     - Title, slug (auto), excerpt, cover image, category, tags.
     - Content: Tiptap rich-text editor with code blocks, embed для YouTube/Twitter.
     - Status: DRAFT / PUBLISHED.
     - Auto-save.
     - Preview button → opens /blog/[slug]?preview=1.

2. CMS — управление статичными данными:
   - src/app/(admin)/cms/kategoriyalar/page.tsx — CRUD категорий: name (мульти-язык future), slug, icon (Lucide name), описание, sortOrder.
   - src/app/(admin)/cms/yutuqlar/page.tsx — CRUD achievements: code, title, description, icon, criteria (JSON).
   - src/app/(admin)/cms/asosiy/page.tsx — Home page sections:
     - Hero copy (editable, мульти-язык future).
     - Featured courses (manual override list).
     - Testimonials (CRUD).
     - FAQ (CRUD).
     - Stats (manual overrides if needed).

3. src/app/(admin)/sozlamalar/page.tsx — Platform settings:
   - Comission rate (по умолчанию 10%).
   - Maintenance mode toggle.
   - Email templates (просмотр + edit).
   - Email sender info.
   - SMTP / Resend config status.
   - Integrations: Mux, Payme, Click, Uzum статусы.

4. Backend:
   - src/modules/admin/blog/ — все CRUD.
   - src/modules/admin/cms/ — CRUD категорий, achievements, content sections (генерализованная таблица ContentSection или specific tables).
   - src/modules/admin/settings/ — key-value таблица Settings + GET/PATCH.

5. Audit log: каждое admin изменение записывается в AuditLog (userId, action, entity, before, after, createdAt). UI для просмотра в /admin/sozlamalar.
```

**Verify:** admin создаёт blog post → он публикуется. Меняет hero copy → отображается на home. Меняет commission → новые выплаты считаются с новой.

---

# STAGE 9 — POST-MVP ФИЧИ (Шаги 36–40)

## Шаг 36. Coding Exercises с in-browser execution

**Промпт:**

```
Реальное выполнение кода в браузере с тестами.

1. Frontend (для js/ts — выполнение в браузере):
   - src/app/(learning)/dars/[lessonId]/page.tsx — если type=CODING:
     - Layout: слева задание + tests output, справа Monaco editor.
     - Monaco editor с TypeScript LSP, формат-on-save, темой по дизайн-системе (монохром).
     - Кнопка "Run" — выполняет код через `new Function()` или Web Worker для безопасности.
     - Кнопка "Submit" — выполняет против всех tests, показывает passed/failed для каждого.
     - При прохождении всех тестов → mark lesson complete.
   - Hints/Solution: кнопка "Hint" показывает по одному, "Solution" — показывает полное решение (но потом нельзя получить полные credits — penalty флаг).

2. Backend src/modules/coding/:
   - POST /coding-exercises/:id/submit — body: { code }. Возвращает { passed, results: [{ testId, passed, output, error? }] }.
   - GET /me/coding-submissions/:exerciseId — мои попытки.

3. Для других языков (Python, Go и т.д.) — server-side через Piston API (https://github.com/engineer-man/piston) или sandbox container. MVP: только JS/TS in-browser. Питон сделать позже через Piston public API.

4. Visual: для тестов breakpoint (passed зелёный, failed красный, pending серый), expanded view показывает actual vs expected.

5. Time/memory limits: 5 seconds, 100MB (для in-browser through Worker termination).

Insturctor side coding builder улучши: добавь "test cases" UI с тремя полями (input, expected output, weight).
```

**Verify:** проходишь coding lesson на JS → пишешь код → tests pass → lesson auto-complete.

---

## Шаг 37. Public Blog system

**Промпт:**

```
1. src/app/(public)/blog/page.tsx — Blog index:
   - Hero: "IlmHub Blog — IT, ta'lim, kariyera"
   - Featured post (large card).
   - Search + filter by category.
   - Grid карточек: cover image, category pill, title, excerpt, author + avatar, дата, read time.
   - Pagination.

2. src/app/(public)/blog/[slug]/page.tsx — Blog post:
   - Hero: cover image + title + meta (author, date, read time, category).
   - Содержимое (rendered markdown с syntax highlighting через rehype-highlight).
   - Table of contents (sticky right на desktop).
   - Share buttons.
   - Author card внизу.
   - Related posts (3 same category).
   - Comments section (если включены): nested threads, login required.

3. Backend src/modules/blog/:
   - GET /blog/posts (paginated)
   - GET /blog/posts/:slug
   - GET /blog/categories
   - POST /blog/posts/:id/comments — protected.
   - GET /blog/posts/:id/comments — threaded.

4. SEO: для каждого поста — generateMetadata с Open Graph, Twitter cards, Schema.org BlogPosting.

5. RSS feed: src/app/blog/rss.xml/route.ts.

6. На public header добавь link "Blog".
```

**Verify:** заходишь на /blog → видишь посты → открываешь пост → читаешь → оставляешь коммент.

---

## Шаг 38. Notifications system (полная)

**Промпт:**

```
1. Backend src/modules/notifications/:
   - Persistent: таблица Notification (создана в шаге 13).
   - Event-driven: используй EventEmitter (или RabbitMQ / Bull). При event'е (review.created, qa.answered, course.published, refund.approved, и т.д.) — handler создаёт Notification + опционально шлёт email.
   - Эндпоинты: GET /me/notifications (paginated), PATCH /me/notifications/:id/read, PATCH /me/notifications/read-all, DELETE.
   - WebSocket / SSE для real-time: src/modules/realtime/ через socket.io или просто Server-Sent Events. При новой notification — push клиенту.

2. Frontend:
   - Bell icon в всех topbar'ах (public, student, instructor, admin) с badge red dot если unread.
   - Dropdown menu при клике: последние 10, кнопка "Hammasi" → /bildirishnomalar.
   - src/app/(student)/bildirishnomalar/page.tsx и аналогично для других ролей — полный list с filter (unread / all), group by date.
   - SSE подключение в layout, при new notification → toast (sonner) + update query cache.

3. Notification preferences (в Settings):
   - Email: новые курсы, новые ответы Q&A, новые сообщения, обновления курсов на которые подписан, маркетинг.
   - In-app: всё то же.
   - Toggle для каждого.

4. Email templates через React Email (https://react.email):
   - VerificationEmail, ResetPasswordEmail, WelcomeEmail, OrderConfirmation, RefundConfirmation, NewQuestionForInstructor, AnswerToYourQuestion, CourseApproved, и т.д. Все на узбекском.
   - Резерв: при ошибке отправки — повтор через bullmq queue.

5. Push notifications (web push) — поставим за рамки MVP. Готова инфраструктура (через service worker и web-push), включается флагом FEATURE_WEB_PUSH.
```

**Verify:** другой пользователь отвечает на твой вопрос → ты видишь toast + badge в bell + email пришёл. Email preferences отключают email notifications.

---

## Шаг 39. Reviews & Ratings — полировка

**Промпт:**

```
До этого reviews были только read (Stage 1-3) и инструктор мог отвечать (Stage 7). Здесь полный flow.

1. После завершения курса (или после 30% progress'а) → prompt "Kursni baholang":
   - Modal с rating selector (1-5 звёзд), comment textarea (optional, max 1000), submit.
   - Backend POST /courses/:slug/reviews (уже есть в шаге 14).

2. Edit/delete review:
   - User может редактировать свой review в течение 30 дней.
   - PATCH /reviews/:id, DELETE /reviews/:id.

3. Helpful votes на reviews:
   - "Yordam berdi" (helpful) кнопка на каждом отзыве.
   - POST /reviews/:id/helpful, DELETE same.
   - Sort by helpful default.

4. Report inappropriate review:
   - Кнопка "Shikoyat qilish" → modal с reason.
   - POST /reviews/:id/report.
   - Admin queue в /admin/sozlamalar/shikoyatlar (или отдельная страница).

5. Instructor response к review:
   - Под каждым отзывом на course details — место для response от instructor (полу-публичный).
   - PATCH /reviews/:id/respond body: { response }.

6. Rating filter на course details Reviews tab: 5★ only / 4★+ / 3★+ / etc.

7. Average rating обновляется как aggregate (в курс) при create/update/delete отзыва — реализуй через Prisma middleware или explicit recalc в service.
```

**Verify:** завершаешь курс → prompt появляется → оставляешь review → видишь helpful votes → instructor отвечает.

---

## Шаг 40. Сертификаты — реальная генерация

**Промпт:**

```
1. Backend:
   - При completion курса (все lessons + quizzes passed) → автоматически создаётся Certificate.
   - Template сертификата:
     - SVG или React component → конвертация в PDF через puppeteer-core + chromium (на Vercel — использовать @sparticuz/chromium для serverless).
     - На сертификате: лого IlmHub, имя студента, название курса, имя инструктора, дата выдачи, certificate number (например IH-2025-12345), QR code → ссылка на public verification page.
   - Сертификат генерится один раз и storage'ится (Supabase Storage / S3). URL хранится в Certificate.pdfUrl.

2. Public verification page:
   - src/app/(public)/sertifikat/[number]/page.tsx — показывает информацию о сертификате: имя, курс, дата, инструктор, валидность. Без auth.
   - Backend: GET /certificates/verify/:number — public endpoint.

3. На /me/sertifikatlar (из шага 18) кнопка "Yuklab olish" — реальный download PDF.

4. Share certificate на LinkedIn:
   - LinkedIn Share URL с предзаполненным шаблоном.
   - "Добавить в LinkedIn профиль" с deep link на их add-cert flow.

5. Custom design: тонкая монохромная рамка, Sora typography, минималистичный визуал — следуй design-system.
```

**Verify:** проходишь курс на 100% → сертификат создаётся → можешь скачать PDF → public URL открывается без auth и показывает данные сертификата.

---

# STAGE 10 — POLISH & DEPLOY (Шаги 41–44)

## Шаг 41. i18n (Uzbek / Russian / English)

**Промпт:**

```
1. Frontend: установи next-intl. Перенеси все UI строки в messages/:
   - messages/uz.json (primary, уже всё на узбекском — нужно вынести из кода).
   - messages/ru.json (перевод).
   - messages/en.json (перевод).
   - Используй ICU MessageFormat для plural/числовых форм.

2. Сделай LanguageSwitcher компонент в topbar (dropdown с UZ / RU / EN).
3. Сохраняй выбор в cookie + middleware: устанавливает locale для path (uz / ru / en — например /ru/kurslar).
4. Default locale = uz.

5. Backend: добавь поддержку Accept-Language header. Для контента курсов и блогпостов — пока остаются на языке создания (фильтр + индикация). Multi-language content (translation fields в Course/BlogPost) — отложено.

6. Дата/время форматирование через date-fns с локалью.
7. Числа: формат с правильным разделителем тысяч (`new Intl.NumberFormat('uz')`).

8. Не переводи user-generated content (отзывы, Q&A) — show as-is.

9. SEO: hreflang теги, отдельные sitemap для каждой локали.

10. Email templates: одно письмо на 3 языка (можно начать с одного шаблона + lookup messages).
```

**Verify:** меняешь язык на RU → весь UI переключается → URL становится /ru/... → перезагрузка сохраняет выбор.

---

## Шаг 42. SEO + Performance optimization

**Промпт:**

```
1. SEO:
   - generateMetadata для всех страниц (title, description, OG image, Twitter cards).
   - JSON-LD schema:
     - HomePage: Organization, WebSite.
     - Course: Course schema (provider, instructor, hasPart).
     - BlogPost: Article schema.
     - Instructor: Person schema.
   - sitemap.ts: dynamic generation из БД для courses, categories, instructors, blog posts.
   - robots.txt: allow всё кроме /admin, /ustoz, /api.

2. Performance:
   - Image optimization: используй next/image везде, with priority для above-fold, lazy для остального.
   - Lighthouse audit — target 95+ Performance, 100 SEO, 100 Accessibility.
   - Fonts: preload Sora, font-display: swap (уже есть).
   - Code splitting: dynamic imports для heavy компонентов (Tiptap, Monaco, recharts).
   - Bundle analysis (next-bundle-analyzer): убрать non-essential deps.
   - ISR для course details и blog posts (revalidate=3600).
   - React Server Components где возможно (default), Client Components только где нужно (interactivity).

3. Accessibility audit:
   - All interactive elements have visible focus rings (using ring-2 ring-ilm-ink).
   - All images have alt.
   - All forms have labels.
   - Color contrast — verify monochrome palette passes WCAG AA (with --ilm-muted-2 для body есть риск, проверь).
   - Keyboard navigation работает везде.
   - Screen reader friendly: aria-labels на icon buttons.

4. Error tracking: установи Sentry (Next.js + NestJS integration), source maps upload.

5. Analytics: PostHog или Plausible (privacy-friendly). Track key events: signup, course_view, enrollment, lesson_complete, purchase.

6. Backend performance:
   - DB query analysis: добавь индексы где slow query'ы.
   - Cache: GET /courses/featured, /categories — Redis (через bullmq's ioredis instance) 5-60 min.
   - N+1 queries: используй Prisma's include/select aggressively.
```

**Verify:** Lighthouse 95+, нет N+1 query в Prisma logs, Sentry получает testовую ошибку.

---

## Шаг 43. Testing + bug fixes

**Промпт:**

```
1. Frontend tests:
   - Установи Vitest + React Testing Library + Playwright.
   - Unit tests: utility functions (formatPrice, calculateProgress, etc), zod schemas.
   - Component tests: критические UI (CourseCard, VideoPlayer wrapper, форма checkout).
   - E2E tests с Playwright:
     - Register → verify → login.
     - Browse catalog → open course → enroll free.
     - Watch lesson → mark complete.
     - Take quiz → pass.
     - Search → filter → sort.
     - Login as instructor → create course → publish (с моками).
     - Login as admin → approve course.

2. Backend tests:
   - Unit (Jest, native NestJS): all services.
   - Integration: каждый controller endpoint (Supertest), с настоящей БД (test database через Docker compose).
   - E2E: критические flows (register → login → enroll → progress).
   - Coverage target: 70%+ для backend, 50%+ для frontend.

3. CI/CD: GitHub Actions
   - .github/workflows/ci.yml: lint + typecheck + test (frontend + backend) на каждый push/PR.
   - Preview deployments через Vercel (frontend).
   - .github/workflows/e2e.yml: Playwright против preview deployment.

4. Bug fixes: после реализации последних шагов сделай smoke test всего приложения, найди и почини обнаруженные баги. Веди список TODO в IMPLEMENTATION_ROADMAP.md.
```

**Verify:** CI зелёный на main, E2E проходит главные flows, 0 critical bugs.

### Статус (выполнено — infra + critical paths)

Тестовая инфраструктура поднята для обоих проектов; написаны критические тесты,
добавлены CI workflow'ы, найдены и починены блокирующие баги. Полное покрытие
70%/50% — итеративная доработка поверх инфраструктуры (см. TODO ниже).

**Backend** (`/backend`)
- Jest unit-конфиг + скрипты `test` / `test:cov` / `typecheck` (+ `db:test:deploy`).
- Хелперы моков `src/test-utils/mocks.ts` (deep-mock Prisma, logger, config).
- Unit-тесты核心 сервисов: `auth` / `orders` / `enrollments` / `reviews` — **32 теста, зелёные**.
- Integration/e2e (gated на `TEST_DATABASE_URL`): добавлены `progress`, `quizzes`,
  `flows` (register→login→enroll→progress). Все 9 e2e-сьютов теперь загружаются.

**Frontend** (`/frontend`)
- Vitest + React Testing Library + Playwright; конфиги `vitest.config.ts`,
  `vitest.setup.ts`, `playwright.config.ts`; скрипты `test` / `test:coverage` /
  `test:e2e` / `typecheck`.
- Unit: `format`, `courses-filter`, zod-схемы auth, утилиты auth/notes/qa.
- Component: `CourseCard`, `LessonVideoPlayer` (Mux замокан), страница `Checkout`,
  cart store — **итого 67 тестов, зелёные**.
- Playwright: реализованы home / catalog (browse→open→search) / auth
  (login render, invalid-creds toast, register). `lint` / `typecheck` / `build` зелёные.

**CI/CD** — `.github/workflows/ci.yml` (frontend lint+typecheck+test;
backend typecheck+unit+integration с Postgres+Redis service-контейнерами) и
`e2e.yml` (поднимает весь стек в CI и гоняет Playwright против localhost —
без Vercel preview). `docker-compose.test.yml` для локального теста-БД. Репозиторий
инициализирован git'ом.

### Починенные баги (smoke + прогон тестов)

1. **Backend e2e вообще не запускались.** `AppModule` не грузился под Jest из-за
   ESM-only зависимостей: `puppeteer` (через `certificate-pdf.service`) и
   `keyv` / `@keyv/redis` / `cacheable` (двухуровневый кеш в `app.module.ts`).
   Починка: стаб `test/mocks/puppeteer.ts` + `moduleNameMapper`, и
   `transformIgnorePatterns`, трансформирующий мелкие ESM-кеш-пакеты (pnpm-safe).
2. **Конфликт типов Keyv** (две версии `keyv`) ломал type-check e2e-конфига —
   перевёл e2e на transpile-only (`isolatedModules`), как и unit; реальный
   type-gate — `pnpm typecheck` (tsc), он зелёный.
3. **`nest build` ломался** на новых тестовых файлах под `src/` — добавил
   `src/test-utils` и `**/*.spec.ts` в `exclude` (`tsconfig.json` + `tsconfig.build.json`).

### TODO / Known issues (итеративно)

- [ ] Догнать покрытие до 70% backend / 50% frontend: unit-тесты остальных
      сервисов и integration на каждый контроллер.
- [ ] Доделать heavier Playwright-флоу (сейчас `test.fixme`): watch lesson→complete,
      take quiz→pass, instructor create→publish, admin approve — нужны page.route()
      моки Mux/Supabase и детерминированные ответы quiz (showcase-quiz seed).
- [ ] Локальный backend integration/e2e требует Postgres (Docker не установлен на
      машине разработчика) — гоняются в CI; локально через `docker-compose.test.yml`.
- [ ] CI активируется после `git remote add` + push на GitHub (workflow-файлы готовы).
- [ ] Опционально: добавить ESLint в backend (сейчас static-gate = `tsc`).
- [ ] (Латентно) Дедупнуть версии `keyv`/`cacheable` через pnpm overrides, чтобы
      убрать конфликт типов на уровне зависимостей.

---

## Шаг 44. Deployment (Vercel + Railway)

**Промпт:**

```
1. Frontend deploy:
   - Connect repo to Vercel.
   - Set environment variables: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_MUX_ENV_KEY, sentry DSN, и т.д.
   - Production branch = main.
   - Preview deployments для всех PR.
   - Custom domain: ilmhub.uz (расскажи как настроить DNS — A records, или CNAME для www, или nameservers Cloudflare).

2. Backend deploy:
   - Connect repo to Railway (или Render, Fly.io).
   - Add Postgres (если не используем Supabase) или connect Supabase.
   - Add Redis для bullmq.
   - Set environment variables: все из .env.example.
   - Production branch = main.
   - Health check: /health.
   - Domain: api.ilmhub.uz.
   - Update CORS_ORIGIN для production.

3. Supabase setup:
   - Production project.
   - RLS policies (если используешь Supabase clients напрямую — но мы через Prisma, так что RLS не критично).
   - Storage buckets: course-thumbnails, blog-images, certificates, avatars.
   - Backup schedule.

4. Mux production credentials.

5. Payment gateways production credentials (Payme, Click, Uzum).

6. Email: production Resend account + verified sender domain (notifications@ilmhub.uz).

7. Monitoring:
   - Uptime monitor (BetterStack / UptimeRobot).
   - Sentry alerts.
   - Log aggregator (Logtail или встроенный Railway / Vercel).

8. Migrations on deploy:
   - Backend deploy hook: `prisma migrate deploy` перед стартом сервера.
   - Не запускать миграции в build-time на serverless.

9. Documentation:
   - Финальный README в IlmHub/ с описанием как запустить, как deploy'ить, environment variables guide.
   - Backend OpenAPI/Swagger публичен на api.ilmhub.uz/api/docs.

10. Launch checklist:
   - SSL ✓
   - Custom domain ✓
   - Test payment in production with реальной картой ✓
   - GDPR/privacy policy reviewed ✓
   - Terms of service на узбекском ✓
   - Контактный email actually monitored ✓
   - Support process documented ✓
```

**Verify:** ilmhub.uz открывается, /api на api.ilmhub.uz отвечает, тестовый payment flow E2E работает на production credentials.

---

# Дополнительные заметки

## Что НЕ включено в этот roadmap (можно добавить позже)

- Mobile app (React Native / Flutter).
- Live streaming уроки.
- Группы / cohort-based courses.
- Marketplace plugin'ов / integrations.
- Affiliate / referral программа.
- Advanced analytics (cohort retention, LTV, churn).
- AI-помощник по обучению (LLM-tutor).
- Multi-tenancy (если хочешь продавать white-label).

## Тонкие моменты которые я учёл

- **Безопасность платежей:** webhook signature verification обязательна (Payme Basic Auth, Click SHA1, Mux signature). Idempotency keys для всех transactional операций.
- **Видео контент:** Mux signed playback URLs — без них любой может качать видео по public URL. Срок жизни token'а — 6 часов с auto-refresh.
- **Storage:** thumbnails курсов, аватары, certificates — Supabase Storage. Не клади в БД.
- **GDPR:** delete account должен реально удалять PII (анонимизация reviews/Q&A, hard delete user record).
- **Курсы и instructor revenue:** при разводе аккаунта с instructor — что делать с его курсами? Транфер на платформу с пометкой "by IlmHub" или удалить? — решить с продуктовой точки зрения.
- **Локализация контента vs UI:** UI на 3 языках, контент курсов остаётся на исходном языке инструктора. Это уже частая дискуссия в LMS — окей для MVP, мульти-язык контента отдельный большой проект.

## Если что-то идёт не по плану

- На каждом шаге проверяй ChangeLog — что было сделано, не дублируется ли.
- Если нашёл баг в более раннем шаге — фикси на месте, не переноси на потом.
- Если хочется поменять архитектурное решение (например, перейти с REST на tRPC) — лучше в начале stage, не в середине.
- Если шаг занимает > 1 час реализации — возможно, его надо разбить на 2.

---

## Verification после каждого шага

Каждый промпт указывает `**Verify:**` — это то, что нужно проверить вручную перед переходом к следующему шагу. Не пропускай это — найденный сейчас баг сэкономит часы потом.

---

## Структура итогового проекта

```
IlmHub/
├── frontend/                  # Next.js app
│   ├── src/
│   │   ├── app/              # routes (App Router)
│   │   ├── components/
│   │   │   ├── ui/           # design-system primitives + shadcn
│   │   │   ├── layout/       # headers, footers, sidebars
│   │   │   └── features/     # feature-scoped components
│   │   ├── features/         # business logic per feature (api, hooks, schemas, store)
│   │   ├── lib/              # utilities, api-client
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── styles/           # globals.css, design tokens
│   │   ├── config/
│   │   └── middleware.ts
│   ├── public/
│   ├── messages/             # i18n
│   └── package.json
├── backend/                  # NestJS app
│   ├── src/
│   │   ├── modules/          # feature modules
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── courses/
│   │   │   ├── enrollments/
│   │   │   ├── payments/
│   │   │   ├── notifications/
│   │   │   └── ...
│   │   ├── common/           # guards, filters, pipes, decorators
│   │   ├── config/
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── package.json
├── design-system/            # (нетронуто)
├── IMPLEMENTATION_ROADMAP.md # копия этого плана
├── requirements.md           # (нетронуто)
└── README.md
```
