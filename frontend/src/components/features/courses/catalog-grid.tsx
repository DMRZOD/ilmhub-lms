"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/features/home/mascot";
import { useAuth } from "@/features/auth/hooks";
import { useFavorites, useToggleFavorite } from "@/features/student/hooks";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/lib/courses-filter";
import type { CourseCard as CourseCardType } from "@/types/api";

import { CourseCard } from "./course-card";
import { CourseCardSkeleton } from "./course-card-skeleton";

interface CatalogGridProps {
  courses: CourseCardType[];
  view: ViewMode;
  loading: boolean;
  onClear: () => void;
}

export function CatalogGrid({
  courses,
  view,
  loading,
  onClear,
}: CatalogGridProps) {
  const router = useRouter();
  const { data: viewer } = useAuth();
  const favoritesQuery = useFavorites(
    { limit: 100 },
    { enabled: Boolean(viewer) },
  );
  const toggle = useToggleFavorite();

  const favoriteIds = useMemo(() => {
    if (!viewer || !favoritesQuery.data) return new Set<string>();
    return new Set(favoritesQuery.data.items.map((c) => c.id));
  }, [viewer, favoritesQuery.data]);

  function handleToggleFavorite(course: CourseCardType) {
    if (!viewer) {
      router.push("/login");
      return;
    }
    toggle.mutate({
      courseId: course.id,
      slug: course.slug,
      nextFavorited: !favoriteIds.has(course.id),
    });
  }

  const gridClass = cn(
    "grid gap-sp-5",
    view === "grid"
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      : "grid-cols-1"
  );

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 12 }).map((_, i) => (
          <CourseCardSkeleton key={i} view={view} />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
        <div className="grid place-items-center rounded-ilm-2xl bg-ilm-ink p-sp-5">
          <Mascot variant={3} size={160} className="opacity-90" />
        </div>
        <h3 className="text-t-24 font-bold text-ilm-ink">
          Hech narsa topilmadi
        </h3>
        <p className="max-w-md text-t-14 text-fg-2">
          Filtrlarni o&apos;zgartirib qayta urinib ko&apos;ring yoki barchasini tozalang.
        </p>
        <Button variant="primary" size="md" onClick={onClear}>
          Filtrlarni tozalash
        </Button>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          view={view}
          variant="public"
          isFavorited={favoriteIds.has(course.id)}
          onToggleFavorite={() => handleToggleFavorite(course)}
        />
      ))}
    </div>
  );
}
