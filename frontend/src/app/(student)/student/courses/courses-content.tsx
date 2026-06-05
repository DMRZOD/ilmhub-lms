"use client";

import * as React from "react";
import Link from "next/link";
import { RotateCcw, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReviewFormModal } from "@/components/features/courses/details/review-form-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CourseCard } from "@/components/features/courses/course-card";
import { CourseCardSkeleton } from "@/components/features/courses/course-card-skeleton";
import { Mascot } from "@/components/features/home/mascot";
import { useEnrollments } from "@/features/student/hooks";
import { useMyRefunds, useRequestRefund } from "@/features/admin/hooks";
import { STUDENT_REFUND_TEXT as RT } from "@/features/admin/labels";
import type { RefundStatus } from "@/features/admin/schemas";
import type {
  EnrolledCourse,
  EnrollmentSort,
  EnrollmentStatusFilter,
} from "@/types/api";

const TABS: Array<{ value: EnrollmentStatusFilter; label: string }> = [
  { value: "all", label: "Hammasi" },
  { value: "inProgress", label: "Jarayonda" },
  { value: "completed", label: "Tugatildi" },
  { value: "notStarted", label: "Boshlanmagan" },
];

const SORT_OPTIONS: Array<{ value: EnrollmentSort; label: string }> = [
  { value: "recent", label: "Oxirgi kirish" },
  { value: "enrolled", label: "Yangi yozildim" },
  { value: "progress", label: "Progress" },
];

export function MeningKurslarimContent() {
  const [status, setStatus] = React.useState<EnrollmentStatusFilter>("all");
  const [sort, setSort] = React.useState<EnrollmentSort>("recent");
  const [refundTarget, setRefundTarget] = React.useState<{
    courseId: string;
    title: string;
  } | null>(null);

  const query = useEnrollments({ status, sort, limit: 24 });
  const items = query.data?.items ?? [];

  // Map each course that already has a refund request to its status, so the
  // card can show "requested" / "rejected" instead of the request button.
  const { data: myRefunds } = useMyRefunds();
  const refundByCourse = React.useMemo(() => {
    const map = new Map<string, RefundStatus>();
    for (const refund of myRefunds ?? []) {
      for (const c of refund.courses) {
        if (!map.has(c.id)) map.set(c.id, refund.status);
      }
    }
    return map;
  }, [myRefunds]);

  return (
    <div className="flex flex-col gap-sp-6">
      <header className="flex flex-col gap-sp-2">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Mening kurslarim
        </h1>
        <p className="text-t-14 text-fg-2">
          Yozilgan kurslaringiz, ulardagi progress va keyingi qadamlar.
        </p>
      </header>

      <Tabs
        value={status}
        onValueChange={(v) => setStatus(v as EnrollmentStatusFilter)}
      >
        <div className="flex flex-col gap-sp-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-sp-2">
            <span className="text-t-12 text-fg-2">Saralash:</span>
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as EnrollmentSort)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
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
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => query.refetch()}
                >
                  Qayta yuklash
                </Button>
              </div>
            ) : items.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-sp-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((enrollment) => (
                  <EnrolledCourseItem
                    key={enrollment.id}
                    enrollment={enrollment}
                    refundStatus={refundByCourse.get(enrollment.course.id)}
                    onRequestRefund={() =>
                      setRefundTarget({
                        courseId: enrollment.course.id,
                        title: enrollment.course.title,
                      })
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <RefundRequestSheet
        target={refundTarget}
        onClose={() => setRefundTarget(null)}
      />
    </div>
  );
}

function EnrolledCourseItem({
  enrollment,
  refundStatus,
  onRequestRefund,
}: {
  enrollment: EnrolledCourse;
  refundStatus?: RefundStatus;
  onRequestRefund: () => void;
}) {
  const isPaid = enrollment.course.priceUsdCents > 0;
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const canRate =
    enrollment.progressPercent >= 30 && !enrollment.reviewedByMe;

  return (
    <div className="flex flex-col gap-sp-2">
      <CourseCard
        course={enrollment.course}
        variant="enrolled"
        href={
          enrollment.resumeLessonId
            ? `/lesson/${enrollment.resumeLessonId}`
            : `/courses/${enrollment.course.slug}`
        }
        progressPercent={enrollment.progressPercent}
        isCompleted={Boolean(enrollment.completedAt)}
      />
      {canRate && (
        <div className="px-sp-1">
          <button
            type="button"
            onClick={() => setReviewOpen(true)}
            className="inline-flex items-center gap-sp-1 text-t-12 font-medium text-fg-3 transition-colors hover:text-ilm-ink"
          >
            <Star className="h-3.5 w-3.5" />
            Baholash
          </button>
        </div>
      )}
      <ReviewFormModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        slug={enrollment.course.slug}
        courseTitle={enrollment.course.title}
      />
      {isPaid && (
        <div className="px-sp-1">
          {refundStatus === "REQUESTED" ? (
            <span className="text-t-12 font-medium text-ilm-warning">
              {RT.requested}
            </span>
          ) : refundStatus === "REJECTED" ? (
            <span className="text-t-12 font-medium text-fg-3">
              {RT.refunded}: rad etilgan
            </span>
          ) : refundStatus ? null : (
            <button
              type="button"
              onClick={onRequestRefund}
              className="inline-flex items-center gap-sp-1 text-t-12 font-medium text-fg-3 transition-colors hover:text-ilm-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {RT.request}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function RefundRequestSheet({
  target,
  onClose,
}: {
  target: { courseId: string; title: string } | null;
  onClose: () => void;
}) {
  const [reason, setReason] = React.useState("");
  const requestRefund = useRequestRefund();

  React.useEffect(() => {
    if (target) setReason("");
  }, [target]);

  function handleSubmit() {
    if (!target || reason.trim().length < 5) return;
    requestRefund.mutate(
      { courseId: target.courseId, reason: reason.trim() },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <Sheet open={Boolean(target)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-left">{RT.dialogTitle}</SheetTitle>
          <SheetDescription className="text-left">
            {target?.title}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-sp-6 flex flex-col gap-sp-4">
          <div className="flex flex-col gap-sp-2">
            <label className="text-t-12 font-semibold text-fg-2">
              {RT.reasonLabel}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={6}
              maxLength={1000}
              placeholder={RT.reasonPlaceholder}
              className="w-full rounded-ilm-md bg-ilm-surface px-4 py-3 text-t-14 font-medium text-ilm-ink ring-1 ring-inset ring-transparent transition-[box-shadow,background-color] duration-base ease-ilm-out placeholder:text-ilm-muted focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink"
            />
          </div>
          <div className="flex items-center gap-sp-2">
            <Button
              iconLeft={RotateCcw}
              disabled={requestRefund.isPending || reason.trim().length < 5}
              onClick={handleSubmit}
            >
              {RT.submit}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {RT.cancel}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
      <div className="grid place-items-center rounded-ilm-2xl bg-ilm-ink p-sp-5">
        <Mascot variant={3} size={160} className="opacity-90" />
      </div>
      <h3 className="text-t-24 font-bold text-ilm-ink">
        Hozircha kurslar yo&apos;q
      </h3>
      <p className="max-w-md text-t-14 text-fg-2">
        Katalogdan o&apos;zingizga mos kursni toping va birinchi qadamni
        boshlang.
      </p>
      <Button variant="primary" size="md" asChild>
        <Link href="/courses">Kurslarni ko&apos;rish</Link>
      </Button>
    </div>
  );
}
