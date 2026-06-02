"use client";

import { CategoryCard } from "@/components/features/categories/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/features/categories/hooks";

import { MotionSection } from "./motion-section";
import { SectionHeading } from "./section-heading";

export function CategoriesSection() {
  const { data, isPending, isError } = useCategories();

  return (
    <MotionSection>
      <SectionHeading
        title="Kategoriyalar bo'yicha o'rganing"
        subtitle="O'zingizga mos yo'nalishni tanlang va birinchi kursni boshlang."
      />
      <div className="mt-sp-10 grid gap-sp-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isPending ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-ilm-lg" />
          ))
        ) : isError ? (
          <p className="col-span-full text-center text-t-14 text-fg-2">
            Kategoriyalarni yuklab bo&apos;lmadi.
          </p>
        ) : (
          (data ?? []).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))
        )}
      </div>
    </MotionSection>
  );
}
