"use client";

import { useEffect } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useLesson, usePrefetchLesson } from "@/features/learning/hooks";

import { LearningShell } from "./learning-shell";
import { VideoLessonContent } from "./video-lesson-content";
import { CodingLessonContent } from "./coding/coding-lesson-view";
import { QuizLessonContent } from "./quiz/quiz-lesson-view";

/**
 * Orchestrator for a lesson route. Owns the lesson query and renders the
 * persistent `LearningShell` once, swapping only the inner content by lesson
 * type. The shell stays mounted across navigation (the page re-renders in
 * place), so moving between lessons updates only the content column.
 */
export function LessonPlayerView({
  lessonId,
  initialTab,
}: {
  lessonId: string;
  initialTab?: string;
}) {
  const lessonQuery = useLesson(lessonId);
  const lesson = lessonQuery.data;
  const prefetchLesson = usePrefetchLesson();

  // Warm the neighbouring lessons (any type) so prev/next is instant.
  const nextLessonId = lesson?.navigation.nextLessonId;
  const prevLessonId = lesson?.navigation.prevLessonId;
  useEffect(() => {
    if (nextLessonId) prefetchLesson(nextLessonId);
    if (prevLessonId) prefetchLesson(prevLessonId);
  }, [nextLessonId, prevLessonId, prefetchLesson]);

  // Cold first load (no cached data yet) — nothing to keep on screen.
  if (lessonQuery.isLoading && !lesson) return <PlayerLoading />;

  if (lessonQuery.isError && !lesson) {
    const status = isAxiosError(lessonQuery.error)
      ? lessonQuery.error.response?.status
      : undefined;
    if (status === 403) return <NotEnrolled />;
    if (status === 404) return <LessonMissing />;
    return <PlayerError message="Darsni yuklashda xatolik yuz berdi." />;
  }

  if (!lesson) return <PlayerLoading />;

  // During a keep-previous-data transition the loaded lesson lags the URL.
  const isCurrent = lesson.id === lessonId;

  const content =
    lesson.type === "QUIZ" ? (
      <QuizLessonContent lessonId={lessonId} lesson={lesson} />
    ) : lesson.type === "CODING" ? (
      <CodingLessonContent lessonId={lessonId} lesson={lesson} />
    ) : (
      <VideoLessonContent
        lessonId={lessonId}
        lesson={lesson}
        initialTab={initialTab}
        isCurrent={isCurrent}
      />
    );

  return (
    <LearningShell
      lesson={lesson}
      currentLessonId={lessonId}
      onLessonHover={prefetchLesson}
    >
      {content}
    </LearningShell>
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
