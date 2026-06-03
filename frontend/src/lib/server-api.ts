/**
 * Server-side fetch helper for public backend data.
 *
 * Uses the native `fetch` (not the axios client) so that:
 *  - Next.js can memoize identical requests within a single render pass
 *    (e.g. `generateMetadata` + the page component fetching the same entity), and
 *  - responses participate in ISR via `next: { revalidate }`.
 *
 * All calls here are anonymous (no auth header) — only public fields are needed
 * for metadata / JSON-LD.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const DEFAULT_REVALIDATE = 3600; // 1h ISR for public catalogue reads
// Hard cap per request so a slow/hanging endpoint can't block static generation
// (e.g. the sitemap) up to Next.js' 60s timeout and fail the production build.
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Fetch a public endpoint. Returns `null` on any non-2xx response or network
 * error so callers can fall back to `notFound()` / static data without throwing
 * during a build.
 */
export async function serverFetch<T>(
  path: string,
  options: { revalidate?: number } = {},
): Promise<T | null> {
  const { revalidate = DEFAULT_REVALIDATE } = options;
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
