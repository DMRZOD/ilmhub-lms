import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  Globe,
  Star,
  Users,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  LANGUAGE_LABELS,
  LEVEL_LABELS,
  formatCompactCount,
  formatDurationHours,
  formatMonthYear,
} from "@/lib/format";
import type { CourseDetail } from "@/types/api";

export function CourseDetailHero({ course }: { course: CourseDetail }) {
  const updatedAt = course.updatedAt ?? course.publishedAt ?? null;

  return (
    <header className="flex flex-col gap-sp-6">
      <div className="flex flex-wrap items-center gap-sp-2">
        <Badge tone="neutral" className="bg-ilm-surface">
          {course.category.name}
        </Badge>
        <Badge tone="neutral" className="bg-ilm-surface">
          {LEVEL_LABELS[course.level]}
        </Badge>
      </div>

      <h1 className="text-t-32 font-extrabold leading-tight tracking-ilm-tight text-ilm-ink md:text-t-48">
        {course.title}
      </h1>

      {course.subtitle && (
        <p className="max-w-2xl text-t-16 leading-relaxed text-fg-2 md:text-t-18">
          {course.subtitle}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-sp-5 gap-y-sp-2 text-t-14 text-fg-2">
        <span className="inline-flex items-center gap-sp-2">
          <Icon icon={Star} size={16} className="text-ilm-warning" />
          <span className="font-semibold text-ilm-ink">
            {course.ratingAvg.toFixed(1)}
          </span>
          <span>({formatCompactCount(course.ratingCount)} sharh)</span>
        </span>
        <span className="inline-flex items-center gap-sp-2">
          <Icon icon={Users} size={16} />
          {formatCompactCount(course.studentsCount)} talaba
        </span>
        <span className="inline-flex items-center gap-sp-2">
          <Icon icon={Clock} size={16} />
          {formatDurationHours(course.durationMinutes)} soat
        </span>
        <span className="inline-flex items-center gap-sp-2">
          <Icon icon={BookOpen} size={16} />
          {course.lessonsCount} dars
        </span>
        <span className="inline-flex items-center gap-sp-2">
          <Icon icon={Globe} size={16} />
          {LANGUAGE_LABELS[course.language]}
        </span>
        {updatedAt && (
          <span className="inline-flex items-center gap-sp-2">
            <Icon icon={Calendar} size={16} />
            Yangilangan: {formatMonthYear(updatedAt)}
          </span>
        )}
      </div>

      <Link
        href={`/instructors/${course.instructor.id}`}
        className="inline-flex w-fit items-center gap-sp-3 rounded-ilm-full transition-colors hover:text-ilm-muted-2"
      >
        <Avatar
          size="sm"
          src={course.instructor.avatarUrl ?? undefined}
          alt={course.instructor.name}
        />
        <span className="flex flex-col">
          <span className="text-t-12 text-fg-2">Ustoz</span>
          <span className="text-t-14 font-semibold text-ilm-ink">
            {course.instructor.name}
          </span>
        </span>
      </Link>
    </header>
  );
}
