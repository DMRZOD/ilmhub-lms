"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ListChecks } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";

interface Props {
  courseTitle: string;
  courseSlug: string;
  progressPercent: number;
  onOpenSidebar?: () => void;
}

export const LearningHeader = React.memo(function LearningHeader({
  courseTitle,
  courseSlug,
  progressPercent,
  onOpenSidebar,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-ilm-border bg-white/55 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center gap-sp-3 px-sp-4 py-sp-3 sm:py-sp-5 sm:px-sp-6">
        <Link
          href="/"
          aria-label="IlmHub bosh sahifa"
          className="shrink-0 rounded-ilm-md"
        >
          <Image
            src="/logo-black.svg"
            alt="IlmHub"
            width={128}
            height={31}
            priority
            className="h-5 w-auto"
          />
        </Link>
        <span aria-hidden className="hidden h-6 w-px bg-ilm-muted md:block" />
        <Link
          href={`/courses/${courseSlug}`}
          title={courseTitle}
          className="hidden min-w-0 flex-1 md:block"
        >
          <span className="block truncate text-t-14 font-bold text-ilm-ink">
            {courseTitle}
          </span>
        </Link>
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
});
