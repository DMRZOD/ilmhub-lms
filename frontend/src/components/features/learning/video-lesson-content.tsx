"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2, VideoOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { usePlaybackToken, useUpdateProgress } from "@/features/learning/hooks";
import type { LessonDetail } from "@/features/learning/types";

import { AutoAdvanceOverlay } from "./auto-advance-overlay";
import { CourseCompleteModal } from "./course-complete-modal";
import { LessonTabs } from "./lesson-tabs";
import {
  LessonVideoPlayer,
  type LessonVideoPlayerHandle,
} from "./lesson-video-player";
import { useLessonHotkeys } from "./use-lesson-hotkeys";

function findLessonTitle(
  sections: Array<{ lessons: Array<{ id: string; title: string }> }>,
  lessonId: string | null,
): string | null {
  if (!lessonId) return null;
  for (const section of sections) {
    for (const lesson of section.lessons) {
      if (lesson.id === lessonId) return lesson.title;
    }
  }
  return null;
}

/**
 * The content column for a VIDEO lesson: player, title + navigation, completion
 * action and the description/notes/Q&A/announcements tabs. Rendered inside the
 * persistent `LearningShell`, so switching lessons swaps only this. ARTICLE
 * lessons have their own `ArticleLessonContent`.
 *
 * `isCurrent` is false during a keep-previous-data transition (the loaded
 * lesson hasn't caught up to the URL yet) — we show a player-area loader then,
 * never the previous lesson's video frame attributed to the new lesson.
 */
export function VideoLessonContent({
  lessonId,
  lesson,
  initialTab,
  isCurrent,
}: {
  lessonId: string;
  lesson: LessonDetail;
  initialTab?: string;
  isCurrent: boolean;
}) {
  const router = useRouter();
  const playbackQuery = usePlaybackToken(
    lesson.muxPlaybackId ? lessonId : undefined,
  );
  const updateProgress = useUpdateProgress(lessonId);

  const playerRef = React.useRef<LessonVideoPlayerHandle | null>(null);
  const [localCompleted, setLocalCompleted] = React.useState(false);
  const [pendingNextId, setPendingNextId] = React.useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = React.useState(false);

  React.useEffect(() => {
    setLocalCompleted(false);
    setPendingNextId(null);
  }, [lessonId]);

  const isCompleted = localCompleted || Boolean(lesson.myProgress.completed);

  const handlePosition = React.useCallback(
    (positionSeconds: number) => {
      updateProgress.mutate({ positionSeconds });
    },
    [updateProgress],
  );

  const triggerCompletion = React.useCallback(
    (positionSeconds: number) => {
      if (isCompleted) return;
      setLocalCompleted(true);
      updateProgress.mutate(
        { positionSeconds, completed: true },
        {
          onSuccess: () => {
            toast.success("Yaxshi ish!");
            const nextId = lesson.navigation.nextLessonId;
            if (nextId) {
              setPendingNextId(nextId);
            } else {
              const willHit100 =
                lesson.course.completedCount + 1 >= lesson.course.totalLessons;
              if (willHit100) {
                const key = `ilm:completion:${lesson.course.id}`;
                if (
                  typeof window !== "undefined" &&
                  !sessionStorage.getItem(key)
                ) {
                  sessionStorage.setItem(key, "1");
                  setShowCompletionModal(true);
                }
              }
            }
          },
          onError: () => {
            setLocalCompleted(false);
            toast.error("Saqlashda xatolik. Qayta urinib ko'ring.");
          },
        },
      );
    },
    [isCompleted, lesson, updateProgress],
  );

  const handleEnded = React.useCallback(() => {
    triggerCompletion(lesson.durationSeconds);
  }, [lesson.durationSeconds, triggerCompletion]);

  const handleWatchedThreshold = React.useCallback(() => {
    triggerCompletion(lesson.myProgress.lastPositionSeconds);
  }, [lesson.myProgress.lastPositionSeconds, triggerCompletion]);

  const goNext = React.useCallback(() => {
    const nextId = lesson.navigation.nextLessonId;
    if (nextId) router.push(`/lesson/${nextId}`);
  }, [lesson.navigation.nextLessonId, router]);

  const goPrev = React.useCallback(() => {
    const prevId = lesson.navigation.prevLessonId;
    if (prevId) router.push(`/lesson/${prevId}`);
  }, [lesson.navigation.prevLessonId, router]);

  useLessonHotkeys({
    playerRef,
    enabled: isCurrent,
    onNext: lesson.navigation.nextLessonId ? goNext : undefined,
    onPrev: lesson.navigation.prevLessonId ? goPrev : undefined,
  });

  const getCurrentTime = React.useCallback(
    () => playerRef.current?.getCurrentTime() ?? null,
    [],
  );
  const seekTo = React.useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds);
  }, []);

  const playbackId = lesson.muxPlaybackId;
  const playback = playbackQuery.data;
  const startTime = lesson.myProgress.lastPositionSeconds;
  const nextLessonTitle = findLessonTitle(lesson.course.sections, pendingNextId);

  return (
    <>
      <div className="relative">
        {playbackId && playback && isCurrent ? (
          <LessonVideoPlayer
            ref={playerRef}
            key={`${lessonId}-${playback.playbackId}`}
            playbackId={playback.playbackId}
            tokenJwt={playback.token}
            startTimeSeconds={startTime}
            title={lesson.title}
            onPositionChange={handlePosition}
            onEnded={handleEnded}
            onWatchedThreshold={handleWatchedThreshold}
          />
        ) : playbackId && (playbackQuery.isLoading || !isCurrent) ? (
          <div className="grid aspect-video w-full place-items-center rounded-ilm-3xl bg-ilm-ink text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <NoVideoPlaceholder />
        )}

        {pendingNextId && nextLessonTitle ? (
          <AutoAdvanceOverlay
            nextLessonTitle={nextLessonTitle}
            onExpire={() => {
              const target = pendingNextId;
              setPendingNextId(null);
              router.push(`/lesson/${target}`);
            }}
            onCancel={() => setPendingNextId(null)}
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-sp-3">
        <div className="text-t-12 font-bold uppercase tracking-wider text-fg-3">
          {lesson.section.title}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-sp-3">
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            {lesson.title}
          </h1>
          <div className="flex items-center gap-sp-2">
            <Button
              variant="secondary"
              size="md"
              iconLeft={ChevronLeft}
              disabled={!lesson.navigation.prevLessonId}
              onClick={goPrev}
            >
              Oldingi
            </Button>
            <Button
              variant="primary"
              size="md"
              iconRight={ChevronRight}
              disabled={!lesson.navigation.nextLessonId}
              onClick={goNext}
            >
              Keyingi dars
            </Button>
          </div>
        </div>
      </div>

      <LessonTabs
        lesson={lesson}
        hasVideo={Boolean(playbackId && playback)}
        getCurrentTime={getCurrentTime}
        seekTo={seekTo}
        initialTab={initialTab}
      />

      <CourseCompleteModal
        open={showCompletionModal}
        courseTitle={lesson.course.title}
        courseSlug={lesson.course.slug}
        onClose={() => setShowCompletionModal(false)}
      />
    </>
  );
}

function NoVideoPlaceholder() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-sp-3 rounded-ilm-3xl bg-ilm-ink text-white">
      <Icon icon={VideoOff} size={36} />
      <p className="text-t-14 font-semibold">Video tez orada</p>
      <p className="max-w-xs text-center text-t-12 text-white/70">
        Bu dars uchun video hali yuklanmagan. Quyidagi materiallar bilan davom
        etishingiz mumkin.
      </p>
    </div>
  );
}
