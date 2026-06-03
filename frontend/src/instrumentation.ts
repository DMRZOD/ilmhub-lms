import * as Sentry from "@sentry/nextjs";

// Next.js calls register() once per server runtime on startup. We load the
// runtime-specific Sentry config so server and edge errors are captured.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Captures errors thrown in React Server Components / route handlers.
export const onRequestError = Sentry.captureRequestError;
