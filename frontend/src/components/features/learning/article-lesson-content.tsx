"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NoteContent } from "@/components/features/notes/rich-text-editor";
import { useUpdateProgress } from "@/features/learning/hooks";
import type { LessonDetail } from "@/features/learning/types";

import { CourseCompleteModal } from "./course-complete-modal";
import { LessonTabs } from "./lesson-tabs";

/**
 * Content column for an ARTICLE ("maqola") lesson: title + navigation, the
 * article body rendered as read-only rich text, the completion action and the
 * notes/Q&A/announcements/resources tabs. Rendered inside the persistent
 * `LearningShell`, so switching lessons swaps only this.
 *
 * Article lessons have no video and nothing to watch, so opening one auto-marks
 * it complete (Udemy-style) once, silently — no toast and no auto-advance.
 * Completion can still be toggled from the curriculum sidebar checkbox.
 */
export function ArticleLessonContent({
  lessonId,
  lesson,
}: {
  lessonId: string;
  lesson: LessonDetail;
}) {
  const router = useRouter();
  const updateProgress = useUpdateProgress(lessonId);

  const [localCompleted, setLocalCompleted] = React.useState(false);
  const [showCompletionModal, setShowCompletionModal] = React.useState(false);
  const autoCompletedFor = React.useRef<string | null>(null);

  React.useEffect(() => {
    setLocalCompleted(false);
  }, [lessonId]);

  const isCompleted = localCompleted || Boolean(lesson.myProgress.completed);

  const markComplete = React.useCallback(() => {
    if (isCompleted) return;
    setLocalCompleted(true);
    updateProgress.mutate(
      { completed: true },
      {
        onSuccess: () => {
          const willHit100 =
            lesson.course.completedCount + 1 >= lesson.course.totalLessons;
          if (willHit100) {
            const key = `ilm:completion:${lesson.course.id}`;
            if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, "1");
              setShowCompletionModal(true);
            }
          }
        },
        onError: () => {
          setLocalCompleted(false);
        },
      },
    );
  }, [isCompleted, lesson, updateProgress]);

  // Udemy-style: opening an article auto-marks it complete once, silently.
  React.useEffect(() => {
    if (isCompleted) return;
    if (autoCompletedFor.current === lessonId) return;
    autoCompletedFor.current = lessonId;
    markComplete();
  }, [lessonId, isCompleted, markComplete]);

  const goNext = React.useCallback(() => {
    const nextId = lesson.navigation.nextLessonId;
    if (nextId) router.push(`/lesson/${nextId}`);
  }, [lesson.navigation.nextLessonId, router]);

  const goPrev = React.useCallback(() => {
    const prevId = lesson.navigation.prevLessonId;
    if (prevId) router.push(`/lesson/${prevId}`);
  }, [lesson.navigation.prevLessonId, router]);

  const hasArticle = Boolean(lesson.articleContent?.trim());

  return (
    <>
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

      <div className="rounded-ilm-2xl border border-ilm-border bg-ilm-bg p-sp-5">
        {hasArticle ? (
          <NoteContent html={lesson.articleContent as string} />
        ) : (
          <p className="text-t-14 text-fg-3">
            Maqola matni tez orada qo&apos;shiladi.
          </p>
        )}
      </div>

      <LessonTabs lesson={lesson} hasVideo={false} />

      <CourseCompleteModal
        open={showCompletionModal}
        courseTitle={lesson.course.title}
        courseSlug={lesson.course.slug}
        onClose={() => setShowCompletionModal(false)}
      />
    </>
  );
}
