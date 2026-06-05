"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Compass } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { InProgressCourse } from "@/features/student/types";

function CourseCard({ course }: { course: InProgressCourse }) {
  return (
    <Link
      href={
        course.resumeLessonId
          ? `/lesson/${course.resumeLessonId}`
          : `/courses/${course.slug}`
      }
      className="group block"
      aria-label={course.title}
    >
      <Card hoverable padding="none" className="flex h-full flex-col overflow-hidden">
        <div className="relative aspect-video overflow-hidden bg-ilm-surface">
          {course.thumbnailUrl && (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-slow ease-ilm-out group-hover:scale-[1.03]"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-sp-3 p-sp-5">
          <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
            {course.category.name}
          </span>
          <h3 className="line-clamp-2 text-t-16 font-semibold text-ilm-ink">
            {course.title}
          </h3>
          <div className="flex items-center gap-sp-2">
            <Avatar
              size="sm"
              src={course.instructor.avatarUrl ?? undefined}
              alt={course.instructor.name}
            />
            <span className="text-t-12 text-fg-2">
              {course.instructor.name}
            </span>
          </div>
          <div className="mt-auto space-y-1.5">
            <Progress value={course.progress} />
            <div className="flex items-center justify-between text-t-12 text-fg-3">
              <span>
                {course.completedLessons} / {course.lessonsCount} dars
              </span>
              <span className="font-semibold text-ilm-ink">
                {course.progress}%
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function InProgressGrid({ courses }: { courses: InProgressCourse[] }) {
  if (courses.length === 0) {
    return (
      <Card padding="lg" className="flex flex-col items-center gap-sp-3 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-ilm-full bg-ilm-surface text-ilm-ink">
          <BookOpen className="h-6 w-6" />
        </span>
        <h3 className="text-t-18 font-bold text-ilm-ink">Hali kurs yo&apos;q</h3>
        <p className="max-w-md text-t-14 text-fg-2">
          Katalogdan o&apos;zingizga mos kursni tanlang va o&apos;rganishni
          boshlang.
        </p>
        <Button asChild className="mt-sp-2">
          <Link href="/courses" className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            Kurslarni ko&apos;rish
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-sp-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
