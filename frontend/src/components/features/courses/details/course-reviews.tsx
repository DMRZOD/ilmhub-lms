"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Flag, Pencil, ThumbsUp, Trash2 } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarInput } from "@/components/ui/star-input";
import {
  useCourseReviews,
  useDeleteReview,
  useToggleReviewHelpful,
} from "@/features/courses/hooks";
import type { ReviewSort } from "@/features/courses/api";
import { useAuth } from "@/features/auth/hooks";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CourseReview } from "@/types/api";
import type { StarRating } from "@/types/course";

import { ReportReviewModal } from "./report-review-modal";
import { ReviewFormModal } from "./review-form-modal";

const EDIT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const PAGE_SIZE = 10;

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Barcha baholar" },
  { value: "5", label: "5 yulduz" },
  { value: "4", label: "4 yulduz va undan yuqori" },
  { value: "3", label: "3 yulduz va undan yuqori" },
  { value: "2", label: "2 yulduz va undan yuqori" },
  { value: "1", label: "1 yulduz va undan yuqori" },
];

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "helpful", label: "Foydali" },
  { value: "newest", label: "Yangi" },
  { value: "oldest", label: "Eski" },
  { value: "highest", label: "Yuqori baho" },
  { value: "lowest", label: "Past baho" },
];

function StarRow({ rating }: { rating: StarRating }) {
  return <StarInput value={rating} readOnly size={14} />;
}

function canStillEdit(review: CourseReview): boolean {
  return Date.now() - new Date(review.createdAt).getTime() < EDIT_WINDOW_MS;
}

export function CourseReviews({
  slug,
  courseTitle,
  rating,
  ratingCount,
  isEnrolled,
}: {
  slug: string;
  courseTitle: string;
  rating: number;
  ratingCount: number;
  isEnrolled?: boolean;
}) {
  const { data: user } = useAuth();
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState("all");
  const [sort, setSort] = React.useState<ReviewSort>("helpful");

  const params = React.useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      rating: filter === "all" ? undefined : Number(filter),
      sort,
    }),
    [page, filter, sort],
  );

  const query = useCourseReviews(slug, params);
  const toggleHelpful = useToggleReviewHelpful(slug, params);
  const deleteReview = useDeleteReview(slug);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<CourseReview | null>(null);
  const [reportTarget, setReportTarget] = React.useState<string | null>(null);

  const items = query.data?.items ?? [];
  const totalPages = query.data?.meta.totalPages ?? 0;

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(review: CourseReview) {
    setEditTarget(review);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-sp-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-sp-4 rounded-ilm-lg bg-ilm-surface px-sp-6 py-sp-5">
        <div className="flex items-center gap-sp-4">
          <div className="text-t-48 font-extrabold leading-none text-ilm-ink">
            {rating.toFixed(1)}
          </div>
          <div className="flex flex-col gap-1">
            <StarRow rating={Math.round(rating) as StarRating} />
            <div className="text-t-12 text-fg-2">
              {ratingCount.toLocaleString("ru-RU")} sharh
            </div>
          </div>
        </div>
        {isEnrolled && (
          <Button variant="primary" size="sm" onClick={openCreate}>
            Sharh qoldirish
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-sp-3">
        <Select
          value={filter}
          onValueChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(v) => {
            setSort(v as ReviewSort);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
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

      {/* List */}
      {query.isPending ? (
        <div className="py-sp-8 text-center text-t-14 text-fg-2">
          Yuklanmoqda…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-ilm-lg border border-dashed border-ilm-border p-sp-8 text-center text-t-14 text-fg-2">
          Hozircha sharhlar yo&apos;q. Birinchi bo&apos;lib o&apos;z fikringizni
          qoldiring.
        </div>
      ) : (
        <ul className="flex flex-col gap-sp-6">
          {items.map((review) => {
            const ownEditable = review.isOwn && canStillEdit(review);
            return (
              <li
                key={review.id}
                className="flex flex-col gap-sp-3 border-b border-ilm-border pb-sp-6 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center gap-sp-3">
                  <Avatar
                    size="sm"
                    src={review.user.avatarUrl ?? undefined}
                    alt={review.user.name}
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="text-t-14 font-semibold text-ilm-ink">
                      {review.user.name}
                    </span>
                    <span className="text-t-12 text-fg-3">
                      {formatShortDate(review.createdAt)}
                    </span>
                  </div>
                  <StarRow rating={review.rating as StarRating} />
                </div>

                {review.comment && (
                  <p className="text-t-14 leading-relaxed text-fg-2">
                    {review.comment}
                  </p>
                )}

                {/* Instructor reply */}
                {review.replyComment && (
                  <div className="ml-sp-6 rounded-ilm-md border-l-2 border-ilm-ink bg-ilm-surface px-sp-4 py-sp-3">
                    <div className="mb-1 flex items-center gap-sp-2 text-t-12 font-semibold text-ilm-ink">
                      Ustoz javobi
                      {review.repliedAt && (
                        <span className="font-normal text-fg-3">
                          · {formatShortDate(review.repliedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-t-14 leading-relaxed text-fg-2">
                      {review.replyComment}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-sp-4 text-t-12">
                  {user && !review.isOwn && (
                    <button
                      type="button"
                      disabled={toggleHelpful.isPending}
                      onClick={() =>
                        toggleHelpful.mutate({
                          id: review.id,
                          hasVoted: Boolean(review.viewerHasVoted),
                        })
                      }
                      className={cn(
                        "inline-flex items-center gap-1.5 transition-colors duration-base ease-ilm-out disabled:opacity-50",
                        review.viewerHasVoted
                          ? "font-semibold text-ilm-ink"
                          : "text-fg-2 hover:text-ilm-ink",
                      )}
                    >
                      <Icon icon={ThumbsUp} size={14} />
                      Yordam berdi
                      {review.helpfulCount > 0 && ` (${review.helpfulCount})`}
                    </button>
                  )}

                  {review.helpfulCount > 0 && (!user || review.isOwn) && (
                    <span className="inline-flex items-center gap-1.5 text-fg-3">
                      <Icon icon={ThumbsUp} size={14} />
                      {review.helpfulCount}
                    </span>
                  )}

                  {user && !review.isOwn && (
                    <button
                      type="button"
                      onClick={() => setReportTarget(review.id)}
                      className="inline-flex items-center gap-1.5 text-fg-3 hover:text-ilm-error"
                    >
                      <Icon icon={Flag} size={14} />
                      Shikoyat qilish
                    </button>
                  )}

                  {ownEditable && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(review)}
                        className="inline-flex items-center gap-1.5 text-fg-2 hover:text-ilm-ink"
                      >
                        <Icon icon={Pencil} size={14} />
                        Tahrirlash
                      </button>
                      <button
                        type="button"
                        disabled={deleteReview.isPending}
                        onClick={() => {
                          if (
                            window.confirm("Sharhni o'chirishni tasdiqlaysizmi?")
                          ) {
                            deleteReview.mutate(review.id);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-fg-3 hover:text-ilm-error disabled:opacity-50"
                      >
                        <Icon icon={Trash2} size={14} />
                        O&apos;chirish
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-sp-3">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            iconLeft={ChevronLeft}
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Oldingi sahifa"
          />
          <span className="text-t-13 text-fg-2">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            iconLeft={ChevronRight}
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Keyingi sahifa"
          />
        </div>
      )}

      <ReviewFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        slug={slug}
        courseTitle={courseTitle}
        initial={
          editTarget
            ? {
                id: editTarget.id,
                rating: editTarget.rating,
                comment: editTarget.comment,
              }
            : undefined
        }
      />

      <ReportReviewModal
        open={reportTarget != null}
        onClose={() => setReportTarget(null)}
        reviewId={reportTarget}
      />
    </div>
  );
}
