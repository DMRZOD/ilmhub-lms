"use client";

import { useMemo, useState } from "react";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
  useQueryStates,
} from "nuqs";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/features/categories/hooks";
import { useCourses } from "@/features/courses/hooks";
import {
  PAGE_SIZE,
  mapFiltersToApi,
} from "@/lib/courses-filter";
import type { CourseFilters, SortKey, ViewMode } from "@/lib/courses-filter";
import type { CourseLanguage, CourseLevel } from "@/types/api";

import { CatalogGrid } from "./catalog-grid";
import { CatalogPagination } from "./catalog-pagination";
import { CatalogTopbar } from "./catalog-topbar";
import { FilterSidebar } from "./filter-sidebar";

const LEVEL_VALUES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const LANG_VALUES = ["UZ", "RU", "EN"] as const;
const SORT_VALUES = [
  "popular",
  "new",
  "rating",
  "price-asc",
  "price-desc",
] as const;
const VIEW_VALUES = ["grid", "list"] as const;

export interface CourseGridProps {
  lockedCategory?: string;
  heading?: { title: string; subtitle?: string } | null;
}

const DEFAULT_HEADING = {
  title: "Barcha kurslar",
  subtitle:
    "Eng yaxshi instruktorlardan o'zingizga mos kursni toping — filtrlar, qidiruv va saralash bilan.",
};

export function CourseGrid({ lockedCategory, heading }: CourseGridProps = {}) {
  const [q, setQ] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  );

  const [filters, setFilters] = useQueryStates(
    {
      cat: parseAsString.withOptions({ clearOnDefault: true }),
      level: parseAsStringEnum([...LEVEL_VALUES]).withOptions({
        clearOnDefault: true,
      }),
      price: parseAsArrayOf(parseAsString)
        .withDefault([])
        .withOptions({ clearOnDefault: true }),
      rating: parseAsInteger.withOptions({ clearOnDefault: true }),
      dur: parseAsArrayOf(parseAsString)
        .withDefault([])
        .withOptions({ clearOnDefault: true }),
      lang: parseAsArrayOf(parseAsStringEnum([...LANG_VALUES]))
        .withDefault([])
        .withOptions({ clearOnDefault: true }),
    },
    { shallow: false },
  );

  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringEnum([...SORT_VALUES])
      .withDefault("popular")
      .withOptions({ clearOnDefault: true }),
  );

  const [view, setView] = useQueryState(
    "view",
    parseAsStringEnum([...VIEW_VALUES])
      .withDefault("grid")
      .withOptions({ clearOnDefault: true }),
  );

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  );

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const currentFilters: CourseFilters = useMemo(
    () => ({
      q,
      categorySlug: filters.cat,
      level: filters.level,
      price: filters.price,
      rating: filters.rating,
      duration: filters.dur,
      languages: filters.lang,
    }),
    [q, filters],
  );

  const sortKey = (sort ?? "popular") as SortKey;
  const safeRequestedPage = Math.max(1, page ?? 1);

  const apiFilters = useMemo(
    () =>
      mapFiltersToApi(
        currentFilters,
        sortKey,
        safeRequestedPage,
        PAGE_SIZE,
        lockedCategory ?? null,
      ),
    [currentFilters, sortKey, safeRequestedPage, lockedCategory],
  );

  const categoriesQuery = useCategories();
  const coursesQuery = useCourses(apiFilters);

  const items = coursesQuery.data?.items ?? [];
  const meta = coursesQuery.data?.meta;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const total = meta?.total ?? 0;

  function resetPage() {
    if (page !== 1 && page !== null) setPage(1);
  }

  function onSearch(v: string) {
    setQ(v);
    resetPage();
  }

  function toggleArray<T extends string>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
  }

  function onSetCategory(slug: string | null) {
    setFilters({ cat: slug });
    resetPage();
  }

  function onSetLevel(level: CourseLevel | null) {
    setFilters({ level });
    resetPage();
  }

  function onTogglePrice(bucketId: string) {
    setFilters({ price: toggleArray(filters.price, bucketId) });
    resetPage();
  }

  function onSetRating(rating: number | null) {
    setFilters({ rating });
    resetPage();
  }

  function onToggleDuration(bucketId: string) {
    setFilters({ dur: toggleArray(filters.dur, bucketId) });
    resetPage();
  }

  function onToggleLanguage(lang: CourseLanguage) {
    setFilters({ lang: toggleArray(filters.lang, lang) });
    resetPage();
  }

  function onClear() {
    setQ("");
    setFilters({
      cat: null,
      level: null,
      price: [],
      rating: null,
      dur: [],
      lang: [],
    });
    setPage(1);
    setMobileFiltersOpen(false);
  }

  const sidebar = (
    <FilterSidebar
      filters={currentFilters}
      categories={categoriesQuery.data ?? []}
      categoriesLoading={categoriesQuery.isLoading}
      onSetCategory={onSetCategory}
      onSetLevel={onSetLevel}
      onTogglePrice={onTogglePrice}
      onSetRating={onSetRating}
      onToggleDuration={onToggleDuration}
      onToggleLanguage={onToggleLanguage}
      onClear={onClear}
      hideCategories={Boolean(lockedCategory)}
    />
  );

  const resolvedHeading =
    heading === undefined ? DEFAULT_HEADING : heading;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-sp-8 px-sp-4 py-sp-8 sm:px-sp-6 lg:py-sp-12">
      {resolvedHeading && (
        <header className="flex flex-col gap-sp-2">
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink sm:text-t-48">
            {resolvedHeading.title}
          </h1>
          {resolvedHeading.subtitle && (
            <p className="max-w-2xl text-t-16 text-fg-2">
              {resolvedHeading.subtitle}
            </p>
          )}
        </header>
      )}

      <div className="grid gap-sp-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-sp-8">{sidebar}</div>
        </aside>

        <div className="flex min-w-0 flex-col gap-sp-6">
          <CatalogTopbar
            q={q}
            onSearch={onSearch}
            sort={sortKey}
            onSortChange={(v) => {
              setSort(v);
              resetPage();
            }}
            view={(view ?? "grid") as ViewMode}
            onViewChange={(v) => setView(v)}
            count={total}
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
          />

          {coursesQuery.isError ? (
            <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
              <h3 className="text-t-24 font-bold text-ilm-ink">
                Kurslarni yuklab bo&apos;lmadi
              </h3>
              <p className="max-w-md text-t-14 text-fg-2">
                Internet ulanishingizni tekshiring va qaytadan urinib ko&apos;ring.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => coursesQuery.refetch()}
              >
                Qayta yuklash
              </Button>
            </div>
          ) : (
            <CatalogGrid
              courses={items}
              view={(view ?? "grid") as ViewMode}
              loading={coursesQuery.isPending}
              onClear={onClear}
            />
          )}

          {!coursesQuery.isPending && !coursesQuery.isError && total > 0 && (
            <CatalogPagination
              page={Math.min(safeRequestedPage, totalPages)}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filtrlar</SheetTitle>
          </SheetHeader>
          <div className="mt-sp-6">{sidebar}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
