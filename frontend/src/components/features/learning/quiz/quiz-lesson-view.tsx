"use client";

import * as React from "react";

import type { LessonDetail } from "@/features/learning/types";

import { LearningHeader } from "../learning-header";
import { LessonSidebar } from "../lesson-sidebar";
import { LessonSidebarSheet } from "../lesson-sidebar-sheet";
import { QuizView } from "./quiz-view";

/**
 * Layout shell for a QUIZ-type lesson. Reuses the learning header + curriculum
 * sidebar (same chrome as the video player) but renders the quiz flow in place
 * of the video/tabs column.
 */
export function QuizLessonView({
  lessonId,
  lesson,
}: {
  lessonId: string;
  lesson: LessonDetail;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

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
            <div className="text-t-12 font-bold uppercase tracking-wider text-fg-3">
              {lesson.section.title}
            </div>
            <QuizView lessonId={lessonId} lesson={lesson} />
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
    </div>
  );
}
