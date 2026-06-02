import type { CourseLanguage, CourseLevel } from "@/types/api";

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: "Boshlang'ich",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Yuqori",
};

export const LANGUAGE_LABELS: Record<CourseLanguage, string> = {
  UZ: "O'zbek",
  RU: "Rus",
  EN: "Ingliz",
};

export function formatPriceUsd(cents: number): string {
  if (cents <= 0) return "Bepul";
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

export function isFreePrice(cents: number): boolean {
  return cents <= 0;
}

/** Money formatter that always shows a dollar amount (e.g. revenue/fees). */
export function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDurationHours(minutes: number): number {
  return Math.max(1, Math.round(minutes / 60));
}

export function formatDurationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} daq`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} soat ${m} daq` : `${h} soat`;
}

export function formatCompactCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

const MONTH_SHORT = [
  "yan",
  "fev",
  "mar",
  "apr",
  "may",
  "iyn",
  "iyl",
  "avg",
  "sen",
  "okt",
  "noy",
  "dek",
];

const MONTH_LONG = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function lessonMinutesFromSeconds(seconds: number): number {
  return Math.max(1, Math.round(seconds / 60));
}
