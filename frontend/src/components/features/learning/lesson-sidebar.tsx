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
} from "@/features/learning/types";

function formatLessonDuration(seconds: number): string {
  const totalSec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Type icon + meta label shown on a lesson row's second line. The type icon
 * stays visible regardless of completion, so a finished lesson is still
 * recognisable as a video / article / quiz / coding exercise. Only videos show
 * a duration; the other types show a short type label instead of a meaningless
 * `0:00`.
 */
function lessonTypeMeta(lesson: CurriculumLesson): {
  icon: LucideIcon;
  label: string;
} {
  switch (lesson.type) {
    case "ARTICLE":
      return { icon: FileText, label: "Maqola" };
    case "QUIZ":
      return { icon: HelpCircle, label: "Test" };
    case "CODING":
      return { icon: Terminal, label: "Mashq" };
    case "VIDEO":
    default:
      return {
        icon: PlayCircle,
        label:
          lesson.durationSeconds > 0
            ? formatLessonDuration(lesson.durationSeconds)
            : "Video",
      };
  }
}

interface Props {
  sections: CurriculumSection[];
  currentLessonId: string;
  completedCount: number;
  totalLessons: number;
  onLessonClick?: () => void;
  onLessonHover?: (lessonId: string) => void;
  onToggleComplete?: (lessonId: string, completed: boolean) => void;
}

export const LessonSidebar = React.memo(function LessonSidebar({
  sections,
  currentLessonId,
  completedCount,
  totalLessons,
  onLessonClick,
  onLessonHover,
  onToggleComplete,
}: Props) {
  // The section holding the current lesson — the only one open by default.
  const currentSectionId = React.useMemo(() => {
    const owning = sections.find((s) =>
      s.lessons.some((l) => l.id === currentLessonId),
    );
    return owning?.id ?? sections[0]?.id;
  }, [sections, currentLessonId]);

  // Controlled so navigating into a collapsed section auto-expands it while
  // keeping the user's other manual expansions intact (Udemy-style).
  const [openSections, setOpenSections] = React.useState<string[]>(() =>
    currentSectionId ? [currentSectionId] : [],
  );
  React.useEffect(() => {
    if (!currentSectionId) return;
    setOpenSections((prev) =>
      prev.includes(currentSectionId) ? prev : [...prev, currentSectionId],
    );
  }, [currentSectionId]);

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
        value={openSections}
        onValueChange={setOpenSections}
        className="flex flex-col"
      >
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            currentLessonId={currentLessonId}
            onLessonClick={onLessonClick}
            onLessonHover={onLessonHover}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </Accordion>
    </aside>
  );
});

function SectionBlock({
  section,
  currentLessonId,
  onLessonClick,
  onLessonHover,
  onToggleComplete,
}: {
  section: CurriculumSection;
  currentLessonId: string;
  onLessonClick?: () => void;
  onLessonHover?: (lessonId: string) => void;
  onToggleComplete?: (lessonId: string, completed: boolean) => void;
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
                onHover={onLessonHover}
                onToggleComplete={onToggleComplete}
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
  onHover,
  onToggleComplete,
}: {
  lesson: CurriculumLesson;
  isCurrent: boolean;
  onClick?: () => void;
  onHover?: (lessonId: string) => void;
  onToggleComplete?: (lessonId: string, completed: boolean) => void;
}) {
  const rowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isCurrent && rowRef.current) {
      rowRef.current.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }, [isCurrent]);

  const meta = lessonTypeMeta(lesson);

  const titleAndMeta = (
    <>
      <span
        className={cn(
          "truncate text-t-13",
          isCurrent ? "font-bold text-ilm-ink" : "font-medium",
          lesson.locked && "text-fg-3",
        )}
      >
        {lesson.title}
      </span>
      <span className="mt-0.5 flex items-center gap-sp-2 text-t-11 font-medium text-fg-3">
        <Icon icon={meta.icon} size={13} className="shrink-0" />
        <span className="tabular-nums">{meta.label}</span>
      </span>
    </>
  );

  return (
    <div
      ref={rowRef}
      data-current={isCurrent || undefined}
      className={cn(
        "flex items-center gap-sp-3 rounded-ilm-md px-sp-2 py-sp-2 transition-colors",
        isCurrent
          ? "bg-ilm-surface shadow-ilm-xs ring-1 ring-inset ring-ilm-border"
          : lesson.locked
            ? "text-fg-3"
            : "hover:bg-ilm-surface",
      )}
    >
      <CompletionCheckbox
        lesson={lesson}
        onToggle={
          onToggleComplete
            ? () => onToggleComplete(lesson.id, !lesson.completed)
            : undefined
        }
      />

      {lesson.locked ? (
        <span className="flex min-w-0 flex-1 cursor-not-allowed flex-col">
          {titleAndMeta}
        </span>
      ) : (
        <Link
          href={`/lesson/${lesson.id}`}
          onClick={onClick}
          onMouseEnter={() => onHover?.(lesson.id)}
          className="flex min-w-0 flex-1 flex-col rounded-ilm-md text-ilm-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ilm-ink focus-visible:ring-offset-1 focus-visible:ring-offset-ilm-paper"
        >
          {titleAndMeta}
        </Link>
      )}
    </div>
  );
}

/**
 * The per-lesson completion control: a circle that shows the type-agnostic
 * "done" state. For unlocked lessons it's a toggle button (mark / un-mark);
 * locked lessons render a static lock instead.
 */
function CompletionCheckbox({
  lesson,
  onToggle,
}: {
  lesson: CurriculumLesson;
  onToggle?: () => void;
}) {
  const base =
    "grid h-6 w-6 shrink-0 place-items-center rounded-ilm-full transition-colors";

  if (lesson.locked) {
    return (
      <span className={cn(base, "bg-ilm-border text-fg-3")} aria-hidden>
        <Icon icon={Lock} size={11} />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!onToggle}
      aria-pressed={lesson.completed}
      aria-label={
        lesson.completed
          ? "Bajarildi deb belgilangan — bekor qilish"
          : "Bajarildi deb belgilash"
      }
      className={cn(
        "group/cb focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ilm-ink focus-visible:ring-offset-1 focus-visible:ring-offset-ilm-paper",
        base,
        lesson.completed
          ? "bg-ilm-success text-white hover:bg-ilm-success/90"
          : "border border-ilm-border text-ilm-ink hover:border-ilm-ink/50",
      )}
    >
      <Icon
        icon={Check}
        size={13}
        className={cn(
          lesson.completed
            ? "opacity-100"
            : "opacity-0 transition-opacity group-hover/cb:opacity-40",
        )}
      />
    </button>
  );
}
