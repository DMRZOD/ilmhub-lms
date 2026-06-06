"use client";

import type { LessonDetail } from "@/features/learning/types";

import { QuizView } from "./quiz-view";

/**
 * Content column for a QUIZ-type lesson. The learning header + curriculum
 * sidebar are provided by the persistent `LearningShell`; this renders only the
 * quiz flow in the content column.
 */
export function QuizLessonContent({
  lessonId,
  lesson,
}: {
  lessonId: string;
  lesson: LessonDetail;
}) {
  return (
    <>
      <div className="text-t-12 font-bold uppercase tracking-wider text-fg-3">
        {lesson.section.title}
      </div>
      <QuizView lessonId={lessonId} lesson={lesson} />
    </>
  );
}
