"use client";

import * as React from "react";

import type { LessonDetail } from "@/features/learning/types";

import { LearningHeader } from "./learning-header";
import { LessonSidebar } from "./lesson-sidebar";
import { LessonSidebarSheet } from "./lesson-sidebar-sheet";

interface Props {
  lesson: LessonDetail;
  currentLessonId: string;
  onLessonHover?: (lessonId: string) => void;
  onToggleComplete?: (lessonId: string, completed: boolean) => void;
  children: React.ReactNode;
}

/**
 * Persistent learning chrome (header + curriculum sidebar) shared by every
 * lesson type. It is rendered once by the lesson orchestrator and stays mounted
 * across navigation — only the `children` content column swaps — so moving
 * between lessons feels instant instead of re-rendering the whole screen.
 */
export function LearningShell({
  lesson,
  currentLessonId,
  onLessonHover,
  onToggleComplete,
  children,
}: Props) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const openSidebar = React.useCallback(() => setMobileSidebarOpen(true), []);

  return (
    <div className="flex min-h-screen flex-col">
      <LearningHeader
        courseTitle={lesson.course.title}
        courseSlug={lesson.course.slug}
        progressPercent={lesson.course.progressPercent}
        onOpenSidebar={openSidebar}
      />

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-sp-4 py-sp-5 sm:px-sp-6">
        <div className="grid gap-sp-5 lg:grid-cols-[1fr_360px]">
          <main className="flex min-w-0 flex-col gap-sp-5">{children}</main>

          <div className="hidden lg:sticky lg:top-[88px] lg:block lg:self-start">
            <LessonSidebar
              sections={lesson.course.sections}
              currentLessonId={currentLessonId}
              completedCount={lesson.course.completedCount}
              totalLessons={lesson.course.totalLessons}
              onLessonHover={onLessonHover}
              onToggleComplete={onToggleComplete}
            />
          </div>
        </div>
      </div>

      <LessonSidebarSheet
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
        sections={lesson.course.sections}
        currentLessonId={currentLessonId}
        completedCount={lesson.course.completedCount}
        totalLessons={lesson.course.totalLessons}
        onLessonHover={onLessonHover}
        onToggleComplete={onToggleComplete}
      />
    </div>
  );
}
