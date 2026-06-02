/**
 * Shared site-level SEO constants.
 * Single source of truth for URL/name/defaults reused by the root layout,
 * sitemap, robots, JSON-LD builders and OG image.
 */
export const SITE_URL = "https://ilmhub.uz";
export const SITE_NAME = "IlmHub";

export const SITE_TITLE = "IlmHub — IT kurslar platformasi";
export const SITE_DESCRIPTION =
  "IlmHub.uz — O'zbekiston bo'ylab eng yaxshi IT kurslar onlayn ta'lim platformasi. Dasturlash, dizayn, ma'lumotlar tahlili va boshqa professional kurslar.";

/** Build an absolute URL for a path (used in canonical/OG/sitemap). */
export function absoluteUrl(path = ""): string {
  if (!path) return SITE_URL;
  return `${SITE_URL}/${path.replace(/^\//, "")}`;
}
