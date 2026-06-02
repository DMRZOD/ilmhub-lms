"use client";

import { CourseCard } from "@/components/features/courses/course-card";
import { CourseCardSkeleton } from "@/components/features/courses/course-card-skeleton";
import { useFeaturedCourses } from "@/features/courses/hooks";

import { MotionSection } from "./motion-section";
import { SectionHeading } from "./section-heading";

export function FeaturedCoursesSection() {
  const { data, isPending, isError } = useFeaturedCourses(4);

  return (
    <MotionSection>
      <SectionHeading
        title="Mashhur kurslar"
        subtitle="Eng yaxshi baholangan va ko'p o'rganilgan kurslarimiz."
        linkHref="/courses"
        linkLabel="Barchasini ko'rish"
      />
      <div className="mt-sp-10 grid gap-sp-6 sm:grid-cols-2 lg:grid-cols-4">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
        ) : isError ? (
          <p className="col-span-full text-center text-t-14 text-fg-2">
            Kurslarni yuklab bo&apos;lmadi.
          </p>
        ) : (
          (data ?? []).slice(0, 4).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </div>
    </MotionSection>
  );
}
