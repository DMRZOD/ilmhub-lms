"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/features/courses/course-card";
import { CourseCardSkeleton } from "@/components/features/courses/course-card-skeleton";
import { Mascot } from "@/components/features/home/mascot";
import { useFavorites, useToggleFavorite } from "@/features/student/hooks";

export function SevimlilarContent() {
  const query = useFavorites({ limit: 24 });
  const toggle = useToggleFavorite();
  const items = query.data?.items ?? [];

  return (
    <div className="flex flex-col gap-sp-6">
      <header className="flex flex-col gap-sp-2">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Sevimlilar
        </h1>
        <p className="text-t-14 text-fg-2">
          Saqlab qo&apos;ygan kurslaringiz — sotib olishni rejalashtirayotgan
          yoki keyinroq qaytmoqchi bo&apos;lganlaringiz.
        </p>
      </header>

      {query.isPending ? (
        <div className="grid gap-sp-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} view="grid" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
          <h3 className="text-t-24 font-bold text-ilm-ink">
            Yuklab bo&apos;lmadi
          </h3>
          <Button variant="primary" size="md" onClick={() => query.refetch()}>
            Qayta yuklash
          </Button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-sp-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              variant="favorite"
              onToggleFavorite={() =>
                toggle.mutate({
                  courseId: course.id,
                  slug: course.slug,
                  nextFavorited: false,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
      <div className="grid place-items-center rounded-ilm-2xl bg-ilm-ink p-sp-5">
        <Mascot variant={3} size={160} className="opacity-90" />
      </div>
      <h3 className="text-t-24 font-bold text-ilm-ink">
        Sevimli kurslar yo&apos;q
      </h3>
      <p className="max-w-md text-t-14 text-fg-2">
        Kataloggan o&apos;tib, yoqqan kursingiz yoniga yurakcha bosing —
        u shu yerda saqlanib qoladi.
      </p>
      <Button variant="primary" size="md" asChild>
        <Link href="/courses">Katalogga o&apos;tish</Link>
      </Button>
    </div>
  );
}
