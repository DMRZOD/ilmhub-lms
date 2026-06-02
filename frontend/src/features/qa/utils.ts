/** Initials for an avatar fallback, e.g. "Ali Valiev" → "AV". */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Relative time in Uzbek, e.g. "2 soat oldin". */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.round((Date.now() - then) / 1000);

  if (diffSec < 60) return "hozirgina";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} soat oldin`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 30) return `${diffDay} kun oldin`;
  const diffMonth = Math.round(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} oy oldin`;
  return `${Math.round(diffMonth / 12)} yil oldin`;
}
