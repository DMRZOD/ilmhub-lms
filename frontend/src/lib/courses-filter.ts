import type {
  CourseFiltersInput,
  CourseLanguage,
  CourseLevel,
  CourseSort,
} from "@/types/api";

export type SortKey = CourseSort;
export type ViewMode = "grid" | "list";

export interface CourseFilters {
  q: string;
  categorySlug: string | null;
  level: CourseLevel | null;
  price: string[];
  rating: number | null;
  duration: string[];
  languages: CourseLanguage[];
}

export const PAGE_SIZE = 12;

interface PriceBucket {
  id: string;
  label: string;
  minCents: number;
  maxCents: number | null;
}

export const PRICE_BUCKETS: readonly PriceBucket[] = [
  { id: "free", label: "Bepul", minCents: 0, maxCents: 0 },
  { id: "0-50", label: "$0 – $50", minCents: 1, maxCents: 5000 },
  { id: "50-100", label: "$50 – $100", minCents: 5001, maxCents: 10000 },
  { id: "100+", label: "$100 dan yuqori", minCents: 10001, maxCents: null },
] as const;

interface DurationBucket {
  id: string;
  label: string;
  minMinutes: number;
  maxMinutes: number | null;
}

export const DURATION_BUCKETS: readonly DurationBucket[] = [
  { id: "0-5", label: "5 soatgacha", minMinutes: 0, maxMinutes: 5 * 60 },
  { id: "5-15", label: "5 – 15 soat", minMinutes: 5 * 60 + 1, maxMinutes: 15 * 60 },
  { id: "15-40", label: "15 – 40 soat", minMinutes: 15 * 60 + 1, maxMinutes: 40 * 60 },
  { id: "40+", label: "40 soatdan ko'p", minMinutes: 40 * 60 + 1, maxMinutes: null },
] as const;

export const RATING_OPTIONS = [
  { value: 4, label: "4★ va undan yuqori" },
  { value: 3, label: "3★ va undan yuqori" },
  { value: 2, label: "2★ va undan yuqori" },
] as const;

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "popular", label: "Mashhurlik bo'yicha" },
  { value: "new", label: "Yangi" },
  { value: "rating", label: "Reyting bo'yicha" },
  { value: "price-asc", label: "Narx: arzondan qimmat" },
  { value: "price-desc", label: "Narx: qimmatdan arzon" },
];

export function mapFiltersToApi(
  filters: CourseFilters,
  sort: SortKey,
  page: number,
  pageSize: number = PAGE_SIZE,
  lockedCategorySlug?: string | null,
): CourseFiltersInput {
  const out: CourseFiltersInput = {
    page,
    limit: pageSize,
    sort,
  };

  const search = filters.q.trim();
  if (search) out.search = search;

  const categorySlug = lockedCategorySlug ?? filters.categorySlug ?? undefined;
  if (categorySlug) out.categorySlug = categorySlug;

  if (filters.level) out.level = [filters.level];

  if (filters.languages.length > 0) out.language = filters.languages;

  if (filters.price.length > 0) {
    const buckets = filters.price
      .map((id) => PRICE_BUCKETS.find((b) => b.id === id))
      .filter((b): b is PriceBucket => Boolean(b));
    if (buckets.length > 0) {
      out.minPrice = Math.min(...buckets.map((b) => b.minCents));
      const maxes = buckets.map((b) => b.maxCents);
      if (!maxes.includes(null)) {
        out.maxPrice = Math.max(...(maxes as number[]));
      }
    }
  }

  if (filters.duration.length > 0) {
    const buckets = filters.duration
      .map((id) => DURATION_BUCKETS.find((b) => b.id === id))
      .filter((b): b is DurationBucket => Boolean(b));
    if (buckets.length > 0) {
      out.minDuration = Math.min(...buckets.map((b) => b.minMinutes));
      const maxes = buckets.map((b) => b.maxMinutes);
      if (!maxes.includes(null)) {
        out.maxDuration = Math.max(...(maxes as number[]));
      }
    }
  }

  if (filters.rating != null) out.minRating = filters.rating;

  return out;
}
