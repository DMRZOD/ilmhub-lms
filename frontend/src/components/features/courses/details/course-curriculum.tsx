"use client";

import { useState } from "react";
import { Lock, PlayCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Icon } from "@/components/ui/icon";
import { LessonPreviewModal } from "./lesson-preview-modal";
import {
  formatDurationHours,
  formatDurationLabel,
  lessonMinutesFromSeconds,
} from "@/lib/format";
import type { CourseSection } from "@/types/api";

export function CourseCurriculum({
  sections,
  totalLessons,
  totalMinutes,
}: {
  sections: CourseSection[];
  totalLessons: number;
  totalMinutes: number;
}) {
  const [preview, setPreview] = useState<{ id: string; title: string } | null>(
    null,
  );

  return (
    <div className="flex flex-col gap-sp-4">
      <div className="flex flex-wrap items-center justify-between gap-sp-2 text-t-14 text-fg-2">
        <span>
          <span className="font-semibold text-ilm-ink">
            {sections.length}
          </span>{" "}
          bo&apos;lim
          {" • "}
          <span className="font-semibold text-ilm-ink">
            {totalLessons}
          </span>{" "}
          dars
          {" • "}
          <span className="font-semibold text-ilm-ink">
            {formatDurationHours(totalMinutes)}
          </span>{" "}
          soat
        </span>
      </div>

      <Accordion
        type="multiple"
        defaultValue={sections[0] ? [sections[0].id] : []}
        className="rounded-ilm-lg border border-ilm-border"
      >
        {sections.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border-b border-ilm-border last:border-b-0"
          >
            <AccordionTrigger className="px-sp-4 text-t-16 font-semibold text-ilm-ink">
              <span className="flex flex-1 items-center justify-between gap-sp-3 pr-sp-3">
                <span>{section.title}</span>
                <span className="text-t-12 font-normal text-fg-2">
                  {section.lessons.length} dars
                  {" • "}
                  {formatDurationLabel(section.durationMinutes)}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-sp-4">
              <ul className="flex flex-col">
                {section.lessons.map((lesson) => {
                  const isPreview = lesson.isPreview;
                  const lessonMin = lessonMinutesFromSeconds(
                    lesson.durationSeconds,
                  );
                  return (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between gap-sp-3 border-t border-ilm-border py-sp-3 first:border-t-0"
                    >
                      <div className="flex min-w-0 items-center gap-sp-3">
                        <Icon
                          icon={isPreview ? PlayCircle : Lock}
                          size={18}
                          className={
                            isPreview ? "text-ilm-ink" : "text-fg-3"
                          }
                        />
                        {isPreview ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreview({ id: lesson.id, title: lesson.title })
                            }
                            className="truncate text-left text-t-14 font-medium text-ilm-ink hover:underline"
                          >
                            {lesson.title}
                          </button>
                        ) : (
                          <span className="truncate text-t-14 text-fg-2">
                            {lesson.title}
                          </span>
                        )}
                        {isPreview && (
                          <span className="shrink-0 rounded-ilm-full bg-ilm-surface px-sp-2 py-0.5 text-t-12 font-semibold text-ilm-ink">
                            Bepul ko&apos;rish
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-t-12 text-fg-3">
                        {lessonMin} daq
                      </span>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <LessonPreviewModal
        lessonId={preview?.id ?? null}
        title={preview?.title}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
