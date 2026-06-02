"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";
import { useReportReview } from "@/features/courses/hooks";

interface ReportReviewModalProps {
  open: boolean;
  onClose: () => void;
  reviewId: string | null;
}

const MAX_REASON = 1000;

export function ReportReviewModal({
  open,
  onClose,
  reviewId,
}: ReportReviewModalProps) {
  const [reason, setReason] = React.useState("");
  const report = useReportReview();

  React.useEffect(() => {
    if (open) setReason("");
  }, [open]);

  function handleSubmit() {
    if (reason.trim().length < 5 || !reviewId || report.isPending) return;
    report.mutate(
      { id: reviewId, reason: reason.trim() },
      { onSuccess: () => onClose() },
    );
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
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-sp-4 rounded-ilm-3xl border border-ilm-border bg-ilm-paper p-sp-6 shadow-ilm-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex flex-col gap-sp-1">
            <DialogPrimitive.Title className="text-t-20 font-extrabold leading-tight text-ilm-ink">
              Shikoyat qilish
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-t-13 text-fg-2">
              Nima uchun ushbu sharh qoidalarga zid ekanini yozing.
            </DialogPrimitive.Description>
          </div>

          <div className="flex flex-col gap-1">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON))}
              rows={4}
              placeholder="Shikoyat sababi"
              className="w-full resize-none rounded-ilm-md bg-ilm-surface px-4 py-3 text-t-14 font-medium text-ilm-ink ring-1 ring-inset ring-transparent transition-[box-shadow,background-color] duration-base ease-ilm-out placeholder:text-ilm-muted focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink"
            />
            <span className="self-end text-t-12 text-fg-3">
              {reason.length}/{MAX_REASON}
            </span>
          </div>

          <div className="flex flex-col gap-sp-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={reason.trim().length < 5 || report.isPending}
            >
              Yuborish
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              disabled={report.isPending}
            >
              Bekor qilish
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
