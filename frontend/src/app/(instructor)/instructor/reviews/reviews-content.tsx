"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CornerDownRight, Star } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  ErrorCard,
  Pager,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import { formatShortDate, initialsOf } from "@/lib/format";
import { useMyCourses } from "@/features/course-wizard/hooks";
import {
  useInstructorReviews,
  useReplyToReview,
} from "@/features/instructor/hooks";
import type { InstructorReview } from "@/features/instructor/schemas";
import type { ReviewsParams } from "@/features/instructor/api";

type StatusFilter = "ALL" | "REPLIED" | "UNREPLIED";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Hammasi" },
  { value: "UNREPLIED", label: "Javobsiz" },
  { value: "REPLIED", label: "Javob berilgan" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating ? "fill-ilm-ink text-ilm-ink" : "text-ilm-border",
          )}
        />
      ))}
    </span>
  );
}

export function ReviewsContent() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [rating, setRating] = useState("ALL");
  const [sort, setSort] = useState<NonNullable<ReviewsParams["sort"]>>("newest");
  const [courseId, setCourseId] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data: courses } = useMyCourses();

  const params = useMemo<ReviewsParams>(
    () => ({
      page,
      sort,
      courseId: courseId === "ALL" ? undefined : courseId,
      rating: rating === "ALL" ? undefined : Number(rating),
      replied:
        status === "ALL" ? undefined : status === "REPLIED" ? true : false,
    }),
    [page, sort, courseId, rating, status],
  );

  const { data, isLoading, isError } = useInstructorReviews(params);

  useEffect(() => {
    setPage(1);
  }, [status, rating, sort, courseId]);

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-1">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Sharhlar
        </h1>
        <p className="text-t-14 text-fg-2">
          Kurslaringizga qoldirilgan sharhlar va javoblar
        </p>
      </div>

      <div className="flex flex-col gap-sp-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-sp-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={cn(
                "rounded-ilm-full px-sp-3 py-sp-2 text-t-12 font-semibold transition",
                status === f.value
                  ? "bg-ilm-ink text-white"
                  : "bg-ilm-surface text-fg-2 hover:text-ilm-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-sp-2">
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger className="h-10 w-36 rounded-ilm-md bg-ilm-surface px-3 text-t-14 font-medium">
              <SelectValue placeholder="Reyting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Barcha reyting</SelectItem>
              {[5, 4, 3, 2, 1].map((r) => (
                <SelectItem key={r} value={String(r)}>
                  {r} yulduz
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(v) => setSort(v as NonNullable<ReviewsParams["sort"]>)}
          >
            <SelectTrigger className="h-10 w-40 rounded-ilm-md bg-ilm-surface px-3 text-t-14 font-medium">
              <SelectValue placeholder="Saralash" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Avval yangi</SelectItem>
              <SelectItem value="oldest">Avval eski</SelectItem>
              <SelectItem value="highest">Yuqori reyting</SelectItem>
              <SelectItem value="lowest">Past reyting</SelectItem>
            </SelectContent>
          </Select>

          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="h-10 w-48 rounded-ilm-md bg-ilm-surface px-3 text-t-14 font-medium">
              <SelectValue placeholder="Kurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Barcha kurslar</SelectItem>
              {courses?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError || !data ? (
        <ErrorCard />
      ) : data.items.length === 0 ? (
        <Card padding="lg">
          <EmptyState icon={Star} text="Sharhlar topilmadi" />
        </Card>
      ) : (
        <div className="flex flex-col gap-sp-4">
          {data.items.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {data && (
        <Pager
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPage={setPage}
        />
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: InstructorReview }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const reply = useReplyToReview();

  async function submit() {
    if (!text.trim()) return;
    try {
      await reply.mutateAsync({ reviewId: review.id, comment: text.trim() });
      toast.success("Javob yuborildi");
      setOpen(false);
      setText("");
    } catch {
      toast.error("Javobni yuborib bo'lmadi");
    }
  }

  return (
    <Card padding="lg" className="flex flex-col gap-sp-3">
      <div className="flex items-center gap-sp-3">
        <Avatar
          size="sm"
          ink
          src={review.user.avatarUrl ?? undefined}
          alt={review.user.name}
          initials={initialsOf(review.user.name)}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-t-14 font-semibold text-ilm-ink">
            {review.user.name}
          </p>
          <p className="truncate text-t-12 text-fg-3">
            {review.course.title} · {formatShortDate(review.createdAt)}
          </p>
        </div>
        <Stars rating={review.rating} />
      </div>

      <p className="text-t-14 text-fg-2">{review.comment}</p>

      {review.replyComment ? (
        <div className="flex gap-sp-2 rounded-ilm-md bg-ilm-surface p-sp-3">
          <CornerDownRight className="mt-0.5 h-4 w-4 shrink-0 text-ilm-muted-2" />
          <div className="min-w-0">
            <p className="text-t-12 font-semibold text-ilm-ink">
              Sizning javobingiz
              {review.repliedAt ? ` · ${formatShortDate(review.repliedAt)}` : ""}
            </p>
            <p className="text-t-14 text-fg-2">{review.replyComment}</p>
          </div>
        </div>
      ) : open ? (
        <div className="flex flex-col gap-sp-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Javobingizni yozing..."
            className="w-full resize-none rounded-ilm-md bg-ilm-surface p-sp-3 text-t-14 text-ilm-ink ring-1 ring-inset ring-transparent focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink"
          />
          <div className="flex items-center gap-sp-2">
            <Button
              size="sm"
              onClick={submit}
              disabled={reply.isPending || !text.trim()}
            >
              Yuborish
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setText("");
              }}
            >
              Bekor qilish
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button
            size="sm"
            variant="secondary"
            iconLeft={CornerDownRight}
            onClick={() => setOpen(true)}
          >
            Javob berish
          </Button>
        </div>
      )}
    </Card>
  );
}
