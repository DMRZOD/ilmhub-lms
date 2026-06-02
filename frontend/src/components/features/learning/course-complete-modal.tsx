"use client";

import * as React from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import confetti from "canvas-confetti";
import { Award, PartyPopper, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ReviewFormModal } from "@/components/features/courses/details/review-form-modal";

interface Props {
  open: boolean;
  courseTitle: string;
  courseSlug: string;
  onClose: () => void;
}

export function CourseCompleteModal({
  open,
  courseTitle,
  courseSlug,
  onClose,
}: Props) {
  const [reviewOpen, setReviewOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const burst = () =>
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.55 },
        scalar: 1.05,
      });
    burst();
    const t = window.setTimeout(burst, 400);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <>
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-sp-4 rounded-ilm-3xl border border-ilm-border bg-ilm-paper p-sp-6 shadow-ilm-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="flex flex-col items-center gap-sp-3 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-ilm-full bg-ilm-ink text-white">
              <Icon icon={PartyPopper} size={32} />
            </span>
            <DialogPrimitive.Title className="text-t-24 font-extrabold leading-tight text-ilm-ink">
              Tabriklaymiz, kursni tugatdingiz!
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-t-14 text-fg-2">
              {courseTitle}
            </DialogPrimitive.Description>
          </div>
          <div className="flex flex-col gap-sp-2">
            <Button asChild variant="primary" size="lg" iconLeft={Award}>
              <Link href="/student/certificates" onClick={onClose}>
                Sertifikatni ko&apos;rish
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="md"
              iconLeft={Star}
              onClick={() => {
                onClose();
                setReviewOpen(true);
              }}
            >
              Kursni baholang
            </Button>
            <Button variant="ghost" size="md" onClick={onClose}>
              Yopish
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>

    <ReviewFormModal
      open={reviewOpen}
      onClose={() => setReviewOpen(false)}
      slug={courseSlug}
      courseTitle={courseTitle}
    />
    </>
  );
}
