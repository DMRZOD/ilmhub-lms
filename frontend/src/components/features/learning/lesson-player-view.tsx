"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  VideoOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  useLesson,
  usePlaybackToken,
  useUpdateProgress,
} from "@/features/learning/hooks";

import { AutoAdvanceOverlay } from "./auto-advance-overlay";
import { CourseCompleteModal } from "./course-complete-modal";
import { LearningHeader } from "./learning-header";
import { LessonActions } from "./lesson-actions";
import { LessonSidebar } from "./lesson-sidebar";
import { LessonSidebarSheet } from "./lesson-sidebar-sheet";
import { LessonTabs } from "./lesson-tabs";
import {
  LessonVideoPlayer,
  type LessonVideoPlayerHandle,
} from "./lesson-video-player";
import { CodingLessonView } from "./coding/coding-lesson-view";
import { QuizLessonView } from "./quiz/quiz-lesson-view";
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

export function LessonPlayerView({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const lessonQuery = useLesson(lessonId);
  const lesson = lessonQuery.data;
  const playbackQuery = usePlaybackToken(
    lesson?.muxPlaybackId ? lessonId : undefined,
  );
  const updateProgress = useUpdateProgress(lessonId);

  const playerRef = React.useRef<LessonVideoPlayerHandle | null>(null);
  const [localCompleted, setLocalCompleted] = React.useState(false);
  const [pendingNextId, setPendingNextId] = React.useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    setLocalCompleted(false);
    setPendingNextId(null);
  }, [lessonId]);

  const isCompleted = localCompleted || Boolean(lesson?.myProgress.completed);

  const handlePosition = React.useCallback(
    (positionSeconds: number) => {
      updateProgress.mutate({ positionSeconds });
    },
    [updateProgress],
  );

  const triggerCompletion = React.useCallback(
    (positionSeconds: number) => {
      if (!lesson) return;
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
                if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
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
    if (!lesson) return;
    triggerCompletion(lesson.durationSeconds);
  }, [lesson, triggerCompletion]);

  const handleManualComplete = React.useCallback(() => {
    if (!lesson) return;
    triggerCompletion(lesson.myProgress.lastPositionSeconds);
  }, [lesson, triggerCompletion]);

  const handleWatchedThreshold = React.useCallback(() => {
    if (!lesson) return;
    triggerCompletion(lesson.myProgress.lastPositionSeconds);
  }, [lesson, triggerCompletion]);

  const goNext = React.useCallback(() => {
    const nextId = lesson?.navigation.nextLessonId;
    if (nextId) router.push(`/lesson/${nextId}`);
  }, [lesson, router]);

  const goPrev = React.useCallback(() => {
    const prevId = lesson?.navigation.prevLessonId;
    if (prevId) router.push(`/lesson/${prevId}`);
  }, [lesson, router]);

  useLessonHotkeys({
    playerRef,
    enabled: Boolean(lesson),
    onNext: lesson?.navigation.nextLessonId ? goNext : undefined,
    onPrev: lesson?.navigation.prevLessonId ? goPrev : undefined,
  });

  const getCurrentTime = React.useCallback(
    () => playerRef.current?.getCurrentTime() ?? null,
    [],
  );
  const seekTo = React.useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds);
  }, []);

  if (lessonQuery.isLoading) return <PlayerLoading />;

  if (lessonQuery.isError) {
    const status = isAxiosError(lessonQuery.error)
      ? lessonQuery.error.response?.status
      : undefined;
    if (status === 403) return <NotEnrolled />;
    if (status === 404) return <LessonMissing />;
    return <PlayerError message="Darsni yuklashda xatolik yuz berdi." />;
  }

  if (!lesson) return <PlayerLoading />;

  if (lesson.type === "QUIZ") {
    return <QuizLessonView lessonId={lessonId} lesson={lesson} />;
  }

  if (lesson.type === "CODING") {
    return <CodingLessonView lessonId={lessonId} lesson={lesson} />;
  }

  const playbackId = lesson.muxPlaybackId;
  const playback = playbackQuery.data;
  const startTime = lesson.myProgress.lastPositionSeconds;
  const nextLessonTitle = findLessonTitle(
    lesson.course.sections,
    pendingNextId,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <LearningHeader
        courseSlug={lesson.course.slug}
        courseTitle={lesson.course.title}
        progressPercent={lesson.course.progressPercent}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
      />

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-sp-4 py-sp-5 sm:px-sp-6">
        <div className="grid gap-sp-5 lg:grid-cols-[1fr_360px]">
          <main className="flex min-w-0 flex-col gap-sp-5">
            <div className="relative">
              {playbackId && playback ? (
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
              ) : playbackId && playbackQuery.isLoading ? (
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
              <LessonActions
                completed={isCompleted}
                isSubmitting={updateProgress.isPending}
                onComplete={handleManualComplete}
              />
            </div>

            <LessonTabs
              lesson={lesson}
              hasVideo={Boolean(playbackId && playback)}
              getCurrentTime={getCurrentTime}
              seekTo={seekTo}
            />
          </main>

          <div className="hidden lg:sticky lg:top-[88px] lg:block lg:self-start">
            <LessonSidebar
              sections={lesson.course.sections}
              currentLessonId={lessonId}
              completedCount={lesson.course.completedCount}
              totalLessons={lesson.course.totalLessons}
            />
          </div>
        </div>
      </div>

      <LessonSidebarSheet
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
        sections={lesson.course.sections}
        currentLessonId={lessonId}
        completedCount={lesson.course.completedCount}
        totalLessons={lesson.course.totalLessons}
      />

      <CourseCompleteModal
        open={showCompletionModal}
        courseTitle={lesson.course.title}
        courseSlug={lesson.course.slug}
        onClose={() => setShowCompletionModal(false)}
      />
    </div>
  );
}

function PlayerLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-ilm-paper">
      <Loader2 className="h-8 w-8 animate-spin text-ilm-ink" />
    </div>
  );
}

function PlayerError({ message }: { message: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-ilm-paper p-sp-6">
      <div className="flex max-w-md flex-col items-center gap-sp-4 text-center">
        <h1 className="text-t-24 font-extrabold text-ilm-ink">{message}</h1>
        <Button asChild>
          <Link href="/student/courses">
            <Icon icon={ArrowLeft} size={14} />
            Mening kurslarim
          </Link>
        </Button>
      </div>
    </div>
  );
}

function NotEnrolled() {
  return (
    <div className="grid min-h-screen place-items-center bg-ilm-paper p-sp-6">
      <div className="flex max-w-md flex-col items-center gap-sp-4 text-center">
        <h1 className="text-t-24 font-extrabold text-ilm-ink">
          Bu kursga yozilmagansiz
        </h1>
        <p className="text-t-14 text-fg-2">
          Darsni ko&apos;rish uchun avval kursga yoziling.
        </p>
        <Button asChild>
          <Link href="/courses">
            <Icon icon={ArrowLeft} size={14} />
            Kurslar katalogi
          </Link>
        </Button>
      </div>
    </div>
  );
}

function LessonMissing() {
  return <PlayerError message="Dars topilmadi." />;
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
