"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPriceUsd, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDeleteCourse, useMyCourses } from "@/features/course-wizard/hooks";
import {
  COURSE_STATUS_LABELS,
  COURSE_STATUSES,
  type CourseStatus,
  type MyCourseListItem,
} from "@/features/course-wizard/schemas";

type Tone = "neutral" | "success" | "warning" | "error";

const STATUS_TONE: Record<CourseStatus, Tone> = {
  DRAFT: "neutral",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "error",
  ARCHIVED: "neutral",
};

type FilterValue = "ALL" | CourseStatus;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "ALL", label: "Hammasi" },
  ...COURSE_STATUSES.map((s) => ({ value: s, label: COURSE_STATUS_LABELS[s] })),
];

export function KurslarContent() {
  const { data: courses, isLoading, isError } = useMyCourses();
  const [filter, setFilter] = useState<FilterValue>("ALL");

  const filtered = useMemo(() => {
    if (!courses) return [];
    if (filter === "ALL") return courses;
    return courses.filter((c) => c.status === filter);
  }, [courses, filter]);

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-wrap items-center justify-between gap-sp-3">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Mening kurslarim
        </h1>
        <Button asChild size="lg" iconLeft={Plus}>
          <Link href="/instructor/courses/new">Yangi kurs yaratish</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-sp-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-ilm-full px-sp-3 py-sp-2 text-t-12 font-semibold transition",
              filter === f.value
                ? "bg-ilm-ink text-white"
                : "bg-ilm-surface text-fg-2 hover:text-ilm-ink",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid min-h-[30vh] place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-ilm-ink" />
        </div>
      ) : isError ? (
        <Card padding="lg">
          <p className="text-t-14 text-fg-2">
            Kurslarni yuklab bo&apos;lmadi. Iltimos, sahifani yangilang.
          </p>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState hasAny={Boolean(courses && courses.length > 0)} />
      ) : (
        <div className="grid gap-sp-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: MyCourseListItem }) {
  const del = useDeleteCourse();
  const title = course.title.trim() || "Nomsiz kurs";

  const onDelete = () => {
    if (!window.confirm(`"${title}" qoralamasini o'chirilsinmi?`)) return;
    del.mutate(course.id, {
      onSuccess: () => toast.success("Kurs o'chirildi"),
      onError: () => toast.error("O'chirib bo'lmadi"),
    });
  };

  return (
    <Card padding="none" className="flex flex-col overflow-hidden">
      <Link
        href={`/instructor/courses/${course.id}/edit?step=1`}
        className="block aspect-video w-full overflow-hidden bg-ilm-surface"
      >
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-ilm-muted">
            <BookOpen className="h-8 w-8" />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-sp-3 p-sp-4">
        <div className="flex items-start justify-between gap-sp-2">
          <h3 className="line-clamp-2 text-t-16 font-bold text-ilm-ink">
            {title}
          </h3>
          <Badge tone={STATUS_TONE[course.status]}>
            {COURSE_STATUS_LABELS[course.status]}
          </Badge>
        </div>

        <div className="flex items-center gap-sp-3 text-t-12 text-fg-3">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course.lessonsCount} dars
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.studentsCount}
          </span>
          <span className="ml-auto font-semibold text-ilm-ink">
            {formatPriceUsd(course.priceUsdCents)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-sp-2 pt-sp-2">
          <span className="text-t-12 text-fg-3">
            {formatShortDate(course.updatedAt)}
          </span>
          <div className="flex items-center gap-sp-2">
            <Button asChild variant="secondary" size="sm" iconLeft={Pencil}>
              <Link href={`/instructor/courses/${course.id}/edit?step=1`}>
                Tahrirlash
              </Link>
            </Button>
            {course.status === "DRAFT" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                iconLeft={Trash2}
                onClick={onDelete}
                disabled={del.isPending}
                aria-label="O'chirish"
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <Card padding="lg" className="flex flex-col items-center gap-sp-3 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-ilm-full bg-ilm-surface text-ilm-ink">
        <BookOpen className="h-6 w-6" />
      </span>
      <h3 className="text-t-18 font-bold text-ilm-ink">
        {hasAny ? "Bu bo'limda kurslar yo'q" : "Hali kurslaringiz yo'q"}
      </h3>
      <p className="max-w-sm text-t-14 text-fg-2">
        Birinchi kursingizni yaratib, bilimlaringizni ulashishni boshlang.
      </p>
      <Button asChild iconLeft={Plus} className="mt-sp-2">
        <Link href="/instructor/courses/new">Yangi kurs yaratish</Link>
      </Button>
    </Card>
  );
}
