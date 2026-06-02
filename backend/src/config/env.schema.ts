import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),

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

  PAYME_MERCHANT_ID: z.string().optional(),

  // Empty string in .env (placeholder before the user fills it) → treat as unset.
  SUPABASE_URL: z
    .preprocess((v) => (v === '' ? undefined : v), z.string().url().optional()),
  SUPABASE_SERVICE_ROLE_KEY: z
    .preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
  SUPABASE_STORAGE_BUCKET: z.string().default('course-assets'),

  FEATURE_WEB_PUSH: z.coerce.boolean().default(false),
});

export type Env = z.infer<typeof envSchema>;
