// Sentry initialisation — imported as the very first module in main.ts so that
// auto-instrumentation can patch libraries before they are loaded. When
// SENTRY_DSN is unset (local dev), Sentry.init is a no-op and adds no overhead.
import * as Sentry from '@sentry/nestjs';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    // Capture 10% of transactions for performance monitoring.
    tracesSampleRate: 0.1,
  });
}
