"use client";

import Link from "next/link";
import { ArrowLeft, ListChecks } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";

interface Props {
  courseSlug: string;
  courseTitle: string;
  progressPercent: number;
  onOpenSidebar?: () => void;
}

export function LearningHeader({
  courseSlug,
  courseTitle,
  progressPercent,
  onOpenSidebar,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-ilm-border bg-white/55 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center gap-sp-3 px-sp-4 py-sp-3 sm:px-sp-6">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-sp-2 rounded-ilm-full border border-ilm-border bg-ilm-bg px-sp-3 py-sp-2 text-t-13 font-semibold text-ilm-ink transition-colors hover:bg-ilm-surface"
        >
          <Icon icon={ArrowLeft} size={14} />
          <span className="hidden sm:inline">Kursga qaytish</span>
        </Link>
        <div className="hidden min-w-0 flex-1 md:block">
          <div className="truncate text-t-14 font-bold text-ilm-ink">
            {courseTitle}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-sp-3">
          <div className="hidden items-center gap-sp-3 sm:flex">
            <Progress
              value={progressPercent}
              label="Kurs progressi"
              className="h-1.5 w-32 md:w-40"
            />
            <Badge tone="neutral" className="tabular-nums">
              {progressPercent}% tugatildi
            </Badge>
          </div>
          <Badge tone="neutral" className="tabular-nums sm:hidden">
            {progressPercent}%
          </Badge>
          {onOpenSidebar ? (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="inline-flex items-center gap-sp-2 rounded-ilm-full border border-ilm-border bg-ilm-bg px-sp-3 py-sp-2 text-t-13 font-semibold text-ilm-ink transition-colors hover:bg-ilm-surface lg:hidden"
              aria-label="Dars rejasini ochish"
            >
              <Icon icon={ListChecks} size={14} />
              <span className="hidden xs:inline">Dars rejasi</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
