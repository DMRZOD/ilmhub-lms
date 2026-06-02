"use client";

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AxiosError } from "axios";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tile } from "@/components/ui/tile";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CourseGrid } from "@/components/features/courses/course-grid";
import { useCategory } from "@/features/categories/hooks";
import { getCategoryIcon } from "@/lib/category-icons";

export function CategoryDetail({ slug }: { slug: string }) {
  const { data, isPending, isError, error, refetch } = useCategory(slug);

  if (isPending) {
    return (
      <section className="border-b border-ilm-border bg-ilm-surface-2">
        <div className="mx-auto flex max-w-7xl flex-col gap-sp-6 px-sp-4 py-sp-10 sm:px-sp-6 lg:py-sp-14">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-12 w-80" />
        </div>
      </section>
    );
  }

  if (isError) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      notFound();
    }
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-sp-4 px-sp-4 py-sp-16 text-center">
        <h2 className="text-t-24 font-bold text-ilm-ink">
          Kategoriyani yuklab bo&apos;lmadi
        </h2>
        <Button variant="primary" size="md" onClick={() => refetch()}>
          Qayta yuklash
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { category } = data;
  const Icon = getCategoryIcon(category.iconName ?? undefined);

  return (
    <>
      <section className="border-b border-ilm-border bg-ilm-surface-2">
        <div className="mx-auto flex max-w-7xl flex-col gap-sp-6 px-sp-4 py-sp-10 sm:px-sp-6 lg:py-sp-14">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-sp-2 text-t-14 text-fg-2"
          >
            <Link
              href="/categories"
              className="font-medium hover:text-ilm-ink"
            >
              Kategoriyalar
            </Link>
            <ChevronRight className="h-4 w-4 text-fg-3" aria-hidden />
            <span className="font-semibold text-ilm-ink">{category.name}</span>
          </nav>

          <div className="flex flex-col gap-sp-4 sm:flex-row sm:items-center sm:gap-sp-6">
            <Tile icon={Icon} variant="ink" size="lg" />
            <div className="flex flex-col gap-sp-2">
              <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink sm:text-t-48">
                {category.name}
              </h1>
              {category.description && (
                <p className="max-w-2xl text-t-16 text-fg-2">
                  {category.description}
                </p>
              )}
              {category.coursesCount != null && (
                <div>
                  <Badge>{category.coursesCount} ta kurs</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <CourseGrid lockedCategory={category.slug} heading={null} />
      </Suspense>
    </>
  );
}
