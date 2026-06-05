"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CurrentLesson } from "@/features/student/types";

export function ContinueCard({ lesson }: { lesson: CurrentLesson }) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-col gap-sp-5 p-sp-5 sm:flex-row">
        <div className="relative aspect-video shrink-0 overflow-hidden rounded-ilm-lg bg-ilm-surface sm:w-64">
          {lesson.thumbnailUrl && (
            <Image
              src={lesson.thumbnailUrl}
              alt={lesson.courseTitle}
              fill
              sizes="(min-width: 640px) 256px, 100vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-sp-3">
          <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
            Davom etish
          </span>
          <h3 className="text-t-18 font-bold text-ilm-ink">
            {lesson.lessonTitle}
          </h3>
          <p className="text-t-14 text-fg-2">{lesson.courseTitle}</p>
          <div className="mt-auto flex flex-col gap-sp-2">
            <Progress value={lesson.progress} />
            <div className="flex items-center justify-between text-t-12 text-fg-3">
              <span>
                {lesson.completedLessons} / {lesson.lessonsCount} dars
              </span>
              <span>{lesson.progress}%</span>
            </div>
            <Button asChild className="mt-sp-2 self-start">
              <Link
                href={`/lesson/${lesson.lessonId}`}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Davom etish
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
