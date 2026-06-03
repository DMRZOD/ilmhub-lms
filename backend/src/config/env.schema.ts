import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  // Comma-separated list of allowed origins, e.g.
  // "https://ilmhub.uz,https://www.ilmhub.uz". Parsed into an array; main.ts
  // also allows Vercel preview deployments (*.vercel.app) on top of this list.
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:3000')
    .transform((s) =>
      s
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),

  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z
    .string()
    .url()
    .default('http://localhost:3001/auth/google/callback'),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  REDIS_URL: z.string().optional(),

  TEST_DATABASE_URL: z.string().optional(),

  MUX_TOKEN_ID: z.string().optional(),
  MUX_TOKEN_SECRET: z.string().optional(),
  MUX_SIGNING_KEY_ID: z.string().optional(),
  MUX_PRIVATE_KEY: z.string().optional(),
  MUX_WEBHOOK_SECRET: z
    .preprocess((v) => (v === '' ? undefined : v), z.string().optional()),

  // Payments — the checkout/webhook flow is currently mocked. These are
  // placeholders for a future real Payme/Click/Uzum integration and are unused
  // until that work lands.
  PAYME_MERCHANT_ID: z.string().optional(),
  PAYME_KEY: z.string().optional(),
  CLICK_SERVICE_ID: z.string().optional(),
  CLICK_MERCHANT_ID: z.string().optional(),
  CLICK_SECRET: z.string().optional(),
  UZUM_MERCHANT_ID: z.string().optional(),
  UZUM_SECRET: z.string().optional(),

  // Error monitoring — empty string (placeholder) → unset, so Sentry no-ops.
  SENTRY_DSN: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().optional(),
  ),

  // Serve Swagger UI at /api/docs. Defaults on; set "false" to disable in prod.
  SWAGGER_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  // Empty string in .env (placeholder before the user fills it) → treat as unset.
  SUPABASE_URL: z
    .preprocess((v) => (v === '' ? undefined : v), z.string().url().optional()),
  SUPABASE_SERVICE_ROLE_KEY: z
    .preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
  SUPABASE_STORAGE_BUCKET: z.string().default('course-assets'),

  FEATURE_WEB_PUSH: z.coerce.boolean().default(false),
});

export type Env = z.infer<typeof envSchema>;
