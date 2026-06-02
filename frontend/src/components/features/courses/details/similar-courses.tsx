"use client";

import { CourseCard } from "@/components/features/courses/course-card";
import { CourseCardSkeleton } from "@/components/features/courses/course-card-skeleton";
import { SectionHeading } from "@/components/features/home/section-heading";
import { useCourses } from "@/features/courses/hooks";

export function SimilarCourses({
  currentSlug,
  categorySlug,
}: {
  currentSlug: string;
  categorySlug: string;
}) {
  const { data, isPending, isError } = useCourses({
    categorySlug,
    limit: 5,
    sort: "rating",
  });

  if (isError) return null;

  const picks = (data?.items ?? [])
    .filter((c) => c.slug !== currentSlug)
    .slice(0, 4);

  return (
    <section className="flex flex-col gap-sp-8">
      <SectionHeading
        title="Shunga o'xshash kurslar"
        subtitle="Sizga yoqishi mumkin bo'lgan boshqa kurslar."
      />
      <div className="grid gap-sp-6 sm:grid-cols-2 lg:grid-cols-4">
        {isPending
          ? Array.from({ length: 4 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))
          : picks.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
      </div>
    </section>
  );
}
