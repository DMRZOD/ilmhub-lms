"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";

import { LessonVideoPlayer } from "@/components/features/learning/lesson-video-player";
import { useLessonPreview } from "@/features/learning/hooks";

interface LessonPreviewModalProps {
  /** The preview lesson to play; the modal is open while this is non-null. */
  lessonId: string | null;
  title?: string;
  onClose: () => void;
}

const noop = () => {};

export function LessonPreviewModal({
  lessonId,
  title,
  onClose,
}: LessonPreviewModalProps) {
  const open = Boolean(lessonId);
  const preview = useLessonPreview(lessonId);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-ilm-3xl border border-ilm-border bg-ilm-paper shadow-ilm-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="flex items-center justify-between gap-sp-3 px-sp-5 py-sp-4">
            <div className="flex min-w-0 flex-col">
              <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
                Bepul ko&apos;rish
              </span>
              <DialogPrimitive.Title className="truncate text-t-16 font-bold text-ilm-ink">
                {title ?? preview.data?.title ?? "Dars"}
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close
              className="grid h-9 w-9 shrink-0 place-items-center rounded-ilm-full text-ilm-ink transition-colors hover:bg-ilm-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-ilm-ink"
              aria-label="Yopish"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          {preview.isPending ? (
            <div className="grid aspect-video w-full place-items-center bg-ilm-ink">
              <Loader2 className="h-8 w-8 animate-spin text-white/80" />
            </div>
          ) : preview.isError || !preview.data?.playbackId ? (
            <div className="grid aspect-video w-full place-items-center bg-ilm-ink px-sp-6 text-center text-t-14 text-white/80">
              Video hozircha mavjud emas
            </div>
          ) : (
            <LessonVideoPlayer
              key={preview.data.playbackId}
              playbackId={preview.data.playbackId}
              tokenJwt={preview.data.token}
              startTimeSeconds={0}
              title={preview.data.title}
              onPositionChange={noop}
              onEnded={noop}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
