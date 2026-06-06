"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CurriculumSection } from "@/features/learning/types";

import { LessonSidebar } from "./lesson-sidebar";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: CurriculumSection[];
  currentLessonId: string;
  completedCount: number;
  totalLessons: number;
  onLessonHover?: (lessonId: string) => void;
}

export function LessonSidebarSheet({
  open,
  onOpenChange,
  sections,
  currentLessonId,
  completedCount,
  totalLessons,
  onLessonHover,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[85vh] flex-col gap-sp-4 overflow-hidden rounded-t-ilm-3xl bg-ilm-paper p-sp-4"
      >
        <SheetHeader>
          <SheetTitle className="text-t-16 font-extrabold text-ilm-ink">
            Dars rejasi
          </SheetTitle>
          <SheetDescription className="sr-only">
            Kursning barcha bo&apos;limlari va darslari
          </SheetDescription>
        </SheetHeader>
        <div className="-mx-sp-2 overflow-y-auto px-sp-2">
          <LessonSidebar
            sections={sections}
            currentLessonId={currentLessonId}
            completedCount={completedCount}
            totalLessons={totalLessons}
            onLessonClick={() => onOpenChange(false)}
            onLessonHover={onLessonHover}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
