"use client";

import { CourseCard } from "@/components/features/courses/course-card";
import type { CourseCard as CourseCardType } from "@/types/api";

export function RecommendedCourses({ courses }: { courses: CourseCardType[] }) {
  if (courses.length === 0) return null;
  return (
    <div className="grid gap-sp-5 sm:grid-cols-2 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
