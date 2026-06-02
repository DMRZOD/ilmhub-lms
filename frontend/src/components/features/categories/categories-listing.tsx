"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/features/categories/hooks";

import { CategoryCard } from "./category-card";

export function CategoriesListing() {
  const { data, isPending, isError, refetch } = useCategories();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-sp-8 px-sp-4 py-sp-8 sm:px-sp-6 lg:py-sp-12">
      <header className="flex flex-col gap-sp-2">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink sm:text-t-48">
          Kategoriyalar
        </h1>
        <p className="max-w-2xl text-t-16 text-fg-2">
          Yo&apos;nalishni tanlang va o&apos;zingizga mos kurslarni toping — frontend,
          backend, dizayn, AI va boshqalar.
        </p>
      </header>

      {isError ? (
        <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
          <h3 className="text-t-24 font-bold text-ilm-ink">
            Kategoriyalarni yuklab bo&apos;lmadi
          </h3>
          <Button variant="primary" size="md" onClick={() => refetch()}>
            Qayta yuklash
          </Button>
        </div>
      ) : (
        <div className="grid gap-sp-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-ilm-lg" />
              ))
            : (data ?? []).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
        </div>
      )}
    </div>
  );
}
