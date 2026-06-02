"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  FileText,
  HelpCircle,
  Lock,
  PlayCircle,
  Terminal,
  type LucideIcon,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type {
  CurriculumLesson,
  CurriculumSection,
  LessonType,
} from "@/features/learning/types";

function formatLessonDuration(seconds: number): string {
  const totalSec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function lessonTypeIcon(type: LessonType): LucideIcon {
  switch (type) {
    case "ARTICLE":
      return FileText;
    case "QUIZ":
      return HelpCircle;
    case "CODING":
      return Terminal;
    case "VIDEO":
    default:
      return PlayCircle;
  }
}

interface Props {
  sections: CurriculumSection[];
  currentLessonId: string;
  completedCount: number;
  totalLessons: number;
  onLessonClick?: () => void;
}

export function LessonSidebar({
  sections,
  currentLessonId,
  completedCount,
  totalLessons,
  onLessonClick,
}: Props) {
  const defaultOpen = React.useMemo(
    () => sections.map((s) => s.id),
    [sections],
  );

  return (
    <aside className="flex h-full flex-col gap-sp-4 rounded-ilm-3xl border border-ilm-border bg-ilm-bg p-sp-4">
      <div className="flex items-center justify-between">
        <h2 className="text-t-14 font-bold text-ilm-ink">Dars rejasi</h2>
        <Badge tone="neutral">
          {completedCount} / {totalLessons}
        </Badge>
      </div>
      <Accordion
        type="multiple"
        defaultValue={defaultOpen}
        className="flex flex-col"
      >
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            currentLessonId={currentLessonId}
            onLessonClick={onLessonClick}
          />
        ))}
      </Accordion>
    </aside>
  );
}

function SectionBlock({
  section,
  currentLessonId,
  onLessonClick,
}: {
  section: CurriculumSection;
  currentLessonId: string;
  onLessonClick?: () => void;
}) {
  const completedInSection = section.lessons.filter((l) => l.completed).length;
  const totalInSection = section.lessons.length;

  return (
    <AccordionItem value={section.id} className="border-ilm-border">
      <AccordionTrigger className="gap-sp-3 py-sp-3 hover:no-underline">
        <div className="flex flex-1 items-center justify-between gap-sp-3">
          <span className="text-t-13 font-bold text-ilm-ink">
            {section.title}
          </span>
          <Badge tone="neutral" className="shrink-0">
            {completedInSection}/{totalInSection} tugatildi
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-sp-2">
        <ul className="flex flex-col gap-1">
          {section.lessons.map((lesson) => (
            <li key={lesson.id}>
              <LessonRow
                lesson={lesson}
                isCurrent={lesson.id === currentLessonId}
                onClick={onLessonClick}
              />
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}

function LessonRow({
  lesson,
  isCurrent,
  onClick,
}: {
  lesson: CurriculumLesson;
  isCurrent: boolean;
  onClick?: () => void;
}) {
  const rowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isCurrent && rowRef.current) {
      rowRef.current.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }, [isCurrent]);

  const TypeIcon = lessonTypeIcon(lesson.type);

  const content = (
    <div
      ref={rowRef}
      data-current={isCurrent || undefined}
      className={cn(
        "relative flex items-center gap-sp-3 rounded-ilm-xl px-sp-3 py-sp-2 transition-colors",
        isCurrent
          ? "bg-ilm-surface font-bold text-ilm-ink before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-ilm-full before:bg-ilm-ink"
          : lesson.locked
            ? "cursor-not-allowed text-fg-3"
            : "text-ilm-ink hover:bg-ilm-surface",
      )}
    >
      <span
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-ilm-full",
          lesson.completed
            ? "bg-ilm-success text-white"
            : lesson.locked
              ? "bg-ilm-border text-fg-3"
              : "bg-ilm-border text-ilm-ink",
        )}
      >
        {lesson.completed ? (
          <Icon icon={Check} size={12} />
        ) : lesson.locked ? (
          <Icon icon={Lock} size={10} />
        ) : (
          <Icon icon={TypeIcon} size={12} />
        )}
      </span>
      <span
        className={cn(
          "flex-1 truncate text-t-13",
          isCurrent ? "font-bold" : "font-medium",
        )}
      >
        {lesson.title}
      </span>
      <span className="text-t-11 font-semibold tabular-nums text-fg-3">
        {formatLessonDuration(lesson.durationSeconds)}
      </span>
    </div>
  );

  if (lesson.locked) return content;
  return (
    <Link
      href={`/lesson/${lesson.id}`}
      onClick={onClick}
      className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ilm-ink focus-visible:ring-offset-1 focus-visible:ring-offset-ilm-paper"
    >
      {content}
    </Link>
  );
}
