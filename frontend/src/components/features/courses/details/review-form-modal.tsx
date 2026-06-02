"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";
import { StarInput } from "@/components/ui/star-input";
import { useCreateReview, useUpdateReview } from "@/features/courses/hooks";

interface ReviewFormModalProps {
  open: boolean;
  onClose: () => void;
  slug: string;
  courseTitle?: string;
  /** When provided, the modal edits this existing review instead of creating one. */
  initial?: { id: string; rating: number; comment: string | null };
}

const MAX_COMMENT = 1000;

export function ReviewFormModal({
  open,
  onClose,
  slug,
  courseTitle,
  initial,
}: ReviewFormModalProps) {
  const isEdit = Boolean(initial);
  const [rating, setRating] = React.useState(initial?.rating ?? 0);
  const [comment, setComment] = React.useState(initial?.comment ?? "");

  const create = useCreateReview(slug);
  const update = useUpdateReview(slug);
  const pending = create.isPending || update.isPending;

  // Reset form whenever the modal is (re)opened.
  React.useEffect(() => {
    if (open) {
      setRating(initial?.rating ?? 0);
      setComment(initial?.comment ?? "");
    }
  }, [open, initial]);

  function handleSubmit() {
    if (rating < 1 || pending) return;
    const body = {
      rating,
      comment: comment.trim() ? comment.trim() : undefined,
    };
    const onDone = { onSuccess: () => onClose() };
    if (isEdit && initial) {
      update.mutate({ id: initial.id, ...body }, onDone);
    } else {
      create.mutate(body, onDone);
    }
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-sp-5 rounded-ilm-3xl border border-ilm-border bg-ilm-paper p-sp-6 shadow-ilm-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex flex-col gap-sp-1">
            <DialogPrimitive.Title className="text-t-20 font-extrabold leading-tight text-ilm-ink">
              {isEdit ? "Sharhni tahrirlash" : "Kursni baholang"}
            </DialogPrimitive.Title>
            {courseTitle && (
              <DialogPrimitive.Description className="text-t-13 text-fg-2">
                {courseTitle}
              </DialogPrimitive.Description>
            )}
          </div>

          <div className="flex flex-col items-center gap-sp-2">
            <StarInput value={rating} onChange={setRating} size={36} />
            <span className="text-t-12 text-fg-3">
              {rating > 0 ? `${rating} / 5` : "Bahoni tanlang"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
              rows={4}
              placeholder="Fikringizni yozing (ixtiyoriy)"
              className="w-full resize-none rounded-ilm-md bg-ilm-surface px-4 py-3 text-t-14 font-medium text-ilm-ink ring-1 ring-inset ring-transparent transition-[box-shadow,background-color] duration-base ease-ilm-out placeholder:text-ilm-muted focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink"
            />
            <span className="self-end text-t-12 text-fg-3">
              {comment.length}/{MAX_COMMENT}
            </span>
          </div>

          <div className="flex flex-col gap-sp-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={rating < 1 || pending}
            >
              {isEdit ? "Saqlash" : "Yuborish"}
            </Button>
            <Button variant="ghost" size="md" onClick={onClose} disabled={pending}>
              Bekor qilish
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
