export const ACCESS_COOKIE = "ilm_access";
export const REFRESH_COOKIE = "ilm_refresh";

export const ACCESS_MAX_AGE = 15 * 60;
export const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

export function getAccessTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ACCESS_COOKIE}=`));
  if (!match) return null;
  const value = match.slice(ACCESS_COOKIE.length + 1);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
