"use client";

import { Download, FileText } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { QaPanel } from "@/components/features/qa/qa-panel";
import type { LessonDetail } from "@/features/learning/types";

import { NotesPanel } from "./notes-panel";

interface Props {
  lesson: LessonDetail;
  hasVideo?: boolean;
  getCurrentTime?: () => number | null;
  seekTo?: (seconds: number) => void;
}

export function LessonTabs({ lesson, hasVideo, getCurrentTime, seekTo }: Props) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList>
        <TabsTrigger value="description">Tavsif</TabsTrigger>
        <TabsTrigger value="notes">Eslatmalarim</TabsTrigger>
        <TabsTrigger value="qa">Savol-Javob</TabsTrigger>
        <TabsTrigger value="resources">Resurslar</TabsTrigger>
      </TabsList>

      <TabsContent value="description">
        <div className="rounded-ilm-2xl border border-ilm-border bg-ilm-bg p-sp-5">
          {lesson.description ? (
            <p className="text-t-14 leading-relaxed text-fg-1">
              {lesson.description}
            </p>
          ) : (
            <p className="text-t-14 text-fg-3">Dars uchun tavsif kiritilmagan.</p>
          )}
          {lesson.articleContent && (
            <div className="mt-sp-4 whitespace-pre-line text-t-14 leading-relaxed text-fg-1">
              {lesson.articleContent}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="notes">
        <NotesPanel
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          hasVideo={hasVideo ?? false}
          getCurrentTime={getCurrentTime}
          seekTo={seekTo}
        />
      </TabsContent>

      <TabsContent value="qa">
        <QaPanel
          courseId={lesson.course.id}
          lessonId={lesson.id}
          enrolled={lesson.enrolled}
        />
      </TabsContent>

      <TabsContent value="resources">
        <div className="rounded-ilm-2xl border border-ilm-border bg-ilm-bg p-sp-5">
          {lesson.resources.length === 0 ? (
            <p className="text-t-14 text-fg-3">
              Bu darsda yuklab olinadigan materiallar mavjud emas.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-sp-3 md:grid-cols-2">
              {lesson.resources.map((res) => (
                <li key={res.url}>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-sp-3 rounded-ilm-xl border border-ilm-border bg-ilm-paper px-sp-3 py-sp-3 text-t-13 font-semibold text-ilm-ink transition-colors hover:bg-ilm-surface"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-ilm-full bg-ilm-surface">
                      <Icon icon={FileText} size={14} />
                    </span>
                    <span className="flex-1 truncate">{res.name}</span>
                    <Icon icon={Download} size={14} className="text-fg-2" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
