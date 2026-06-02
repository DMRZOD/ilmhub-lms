"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Check,
  Clock,
  ExternalLink,
  Eye,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoteContent } from "@/components/features/notes/rich-text-editor";
import { useSubmitForReview } from "@/features/course-wizard/hooks";
import {
  COURSE_LEVEL_LABELS,
  LESSON_TYPE_LABELS,
  type WizardCourse,
} from "@/features/course-wizard/schemas";
import { formatPriceUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

const MIN_LESSONS = 3;

export function StepPublish({ course }: { course: WizardCourse }) {
  const router = useRouter();
  const submit = useSubmitForReview(course.id);
  const checklist = buildChecklist(course);
  const allOk = checklist.every((c) => c.ok);
  const locked =
    course.status === "PENDING_REVIEW" || course.status === "PUBLISHED";

  const onSubmit = () =>
    submit.mutate(undefined, {
      onSuccess: () => {
        toast.success("Kurs ko'rib chiqishga yuborildi");
        router.push("/instructor/courses");
      },
      onError: () =>
        toast.error("Yuborib bo'lmadi — ro'yxatni tekshiring"),
    });

  return (
    <div className="flex flex-col gap-sp-6">
      <StatusBanner status={course.status} slug={course.slug} />

      {!locked && (
        <div className="flex flex-col gap-sp-3">
          <h3 className="text-t-16 font-bold text-ilm-ink">
            Nashrga tayyorlik
          </h3>
          <div className="flex flex-col gap-sp-2 rounded-ilm-2xl border border-ilm-border bg-ilm-paper p-sp-4">
            {checklist.map((item) => (
              <div key={item.key} className="flex items-center gap-sp-2">
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-ilm-full",
                    item.ok
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-amber-100 text-amber-600",
                  )}
                >
                  {item.ok ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-t-14",
                    item.ok ? "text-fg-2" : "text-ilm-ink",
                  )}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <Button
            type="button"
            size="lg"
            iconLeft={Send}
            onClick={onSubmit}
            disabled={!allOk || submit.isPending}
            className="self-start"
          >
            Tekshiruvga yuborish
          </Button>
          {!allOk && (
            <p className="text-t-12 text-amber-600">
              Barcha shartlar bajarilgach, kursni yuborishingiz mumkin.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-sp-3">
        <div className="flex items-center gap-sp-2 text-fg-2">
          <Eye className="h-4 w-4" />
          <h3 className="text-t-16 font-bold text-ilm-ink">
            Ko&apos;rinishi (preview)
          </h3>
        </div>
        <CoursePreview course={course} />
      </div>
    </div>
  );
}

function StatusBanner({
  status,
  slug,
}: {
  status: WizardCourse["status"];
  slug: string;
}) {
  if (status === "PENDING_REVIEW") {
    return (
      <div className="rounded-ilm-2xl border border-amber-200 bg-amber-50 p-sp-4">
        <p className="text-t-14 font-semibold text-amber-800">
          Kurs ko&apos;rib chiqilmoqda
        </p>
        <p className="text-t-12 text-amber-700">
          Administrator tasdiqlagach, kurs chop etiladi.
        </p>
      </div>
    );
  }
  if (status === "PUBLISHED") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-sp-2 rounded-ilm-2xl border border-emerald-200 bg-emerald-50 p-sp-4">
        <div>
          <p className="text-t-14 font-semibold text-emerald-800">
            Kurs chop etilgan
          </p>
          <p className="text-t-12 text-emerald-700">
            O&apos;quvchilar uni katalogda ko&apos;rishi mumkin.
          </p>
        </div>
        <Button asChild variant="secondary" size="sm" iconRight={ExternalLink}>
          <Link href={`/courses/${slug}`} target="_blank">
            Ochish
          </Link>
        </Button>
      </div>
    );
  }
  if (status === "REJECTED") {
    return (
      <div className="rounded-ilm-2xl border border-red-200 bg-red-50 p-sp-4">
        <p className="text-t-14 font-semibold text-red-800">
          Kurs rad etilgan
        </p>
        <p className="text-t-12 text-red-700">
          Kerakli o&apos;zgartirishlarni kiritib, qayta yuboring.
        </p>
      </div>
    );
  }
  return null;
}

function CoursePreview({ course }: { course: WizardCourse }) {
  const lessons = course.sections.flatMap((s) => s.lessons);

  return (
    <div className="overflow-hidden rounded-ilm-2xl border border-ilm-border bg-ilm-paper">
      <div className="aspect-video w-full overflow-hidden bg-ilm-surface">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-ilm-muted">
            <BookOpen className="h-8 w-8" />
          </span>
        )}
      </div>

      <div className="flex flex-col gap-sp-4 p-sp-5">
        <div className="flex flex-col gap-sp-2">
          <div className="flex flex-wrap items-center gap-sp-2">
            <Badge tone="neutral">{COURSE_LEVEL_LABELS[course.level]}</Badge>
            <span className="inline-flex items-center gap-1 text-t-12 text-fg-3">
              <BookOpen className="h-3.5 w-3.5" />
              {course.lessonsCount} dars
            </span>
            <span className="inline-flex items-center gap-1 text-t-12 text-fg-3">
              <Clock className="h-3.5 w-3.5" />
              {course.durationMinutes} daqiqa
            </span>
          </div>
          <h2 className="text-t-24 font-extrabold tracking-ilm-tight text-ilm-ink">
            {course.title.trim() || "Nomsiz kurs"}
          </h2>
          {course.subtitle && (
            <p className="text-t-14 text-fg-2">{course.subtitle}</p>
          )}
          <p className="text-t-18 font-bold text-ilm-ink">
            {formatPriceUsd(course.priceUsdCents)}
          </p>
        </div>

        {course.longDescription && (
          <div className="border-t border-ilm-border pt-sp-3">
            <NoteContent html={course.longDescription} />
          </div>
        )}

        {course.learningOutcomes.length > 0 && (
          <PreviewList
            title="Nimalarni o'rganasiz"
            items={course.learningOutcomes}
          />
        )}
        {course.requirements.length > 0 && (
          <PreviewList title="Talablar" items={course.requirements} />
        )}

        <div className="flex flex-col gap-sp-2 border-t border-ilm-border pt-sp-3">
          <h3 className="text-t-14 font-bold text-ilm-ink">Kurs dasturi</h3>
          {course.sections.map((section) => (
            <div key={section.id} className="flex flex-col gap-1">
              <p className="text-t-13 font-semibold text-ilm-ink">
                {section.title}
              </p>
              {section.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between gap-sp-2 pl-sp-3 text-t-12 text-fg-2"
                >
                  <span className="truncate">{lesson.title}</span>
                  <span className="flex shrink-0 items-center gap-sp-2 text-fg-3">
                    {lesson.isPreview && <Badge tone="success">Bepul</Badge>}
                    {LESSON_TYPE_LABELS[lesson.type]}
                  </span>
                </div>
              ))}
            </div>
          ))}
          {lessons.length === 0 && (
            <p className="text-t-12 text-fg-3">Darslar qo&apos;shilmagan.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-sp-2 border-t border-ilm-border pt-sp-3">
      <h3 className="text-t-14 font-bold text-ilm-ink">{title}</h3>
      <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-sp-2 text-t-13 text-fg-2"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildChecklist(course: WizardCourse) {
  const lessons = course.sections.flatMap((s) => s.lessons);
  const videosReady = lessons
    .filter((l) => l.type === "VIDEO")
    .every((l) => l.muxAssetStatus === "READY");
  const articlesFilled = lessons
    .filter((l) => l.type === "ARTICLE")
    .every((l) => (l.articleContent ?? "").trim().length > 0);
  const quizzesReady = lessons
    .filter((l) => l.type === "QUIZ")
    .every((l) => (l.quiz?.questions.length ?? 0) > 0);
  const codingReady = lessons
    .filter((l) => l.type === "CODING")
    .every((l) => (l.coding?.tests.length ?? 0) > 0);

  return [
    { key: "title", label: "Kurs nomi kiritilgan", ok: course.title.trim().length > 0 },
    {
      key: "thumbnail",
      label: "Muqova rasmi yuklangan",
      ok: Boolean(course.thumbnailUrl),
    },
    {
      key: "description",
      label: "Qisqa tavsif kiritilgan",
      ok: course.description.trim().length > 0,
    },
    {
      key: "minLessons",
      label: `Kamida ${MIN_LESSONS} ta dars qo'shilgan`,
      ok: course.lessonsCount >= MIN_LESSONS,
    },
    { key: "videosReady", label: "Barcha videolar tayyor", ok: videosReady },
    {
      key: "articlesFilled",
      label: "Barcha maqolalar to'ldirilgan",
      ok: articlesFilled,
    },
    {
      key: "quizzesReady",
      label: "Har bir testda kamida 1 ta savol bor",
      ok: quizzesReady,
    },
    {
      key: "codingReady",
      label: "Har bir kod mashqida test bor",
      ok: codingReady,
    },
  ];
}
