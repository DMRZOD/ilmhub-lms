// Sentry config for the Node.js server runtime. Loaded by instrumentation.ts.
// No-ops when NEXT_PUBLIC_SENTRY_DSN is unset (local dev).
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}
