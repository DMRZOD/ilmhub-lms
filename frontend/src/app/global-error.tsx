"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Catches errors thrown in the root layout itself. Because it replaces the
// root layout, it must render its own <html>/<body>. Reports to Sentry.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="uz">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>
          Nimadir noto&apos;g&apos;ri ketdi
        </h1>
        <p style={{ maxWidth: "28rem", color: "#555" }}>
          Kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib ko&apos;ring.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: "0.75rem",
            background: "#111",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
          }}
        >
          Qayta urinish
        </button>
      </body>
    </html>
  );
}
