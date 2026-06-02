"use client";

import { CheckCircle2, GraduationCap, MessageSquare } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { QuestionListItem as QuestionListItemType } from "@/features/qa/types";
import { formatRelativeTime, initialsOf } from "@/features/qa/utils";

interface Props {
  question: QuestionListItemType;
  onOpen: () => void;
}

export function QuestionListItem({ question, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-sp-2 rounded-ilm-2xl border border-ilm-border bg-ilm-paper p-sp-4 text-left transition-colors hover:bg-ilm-surface"
    >
      <div className="flex flex-wrap items-center gap-sp-2">
        {question.isResolved && (
          <Badge tone="success" icon={CheckCircle2}>
            Hal qilindi
          </Badge>
        )}
        {question.hasInstructorAnswer && (
          <Badge tone="info" icon={GraduationCap}>
            Ustoz javob bergan
          </Badge>
        )}
      </div>

      <h4 className="text-t-15 font-bold text-ilm-ink">{question.title}</h4>
      <p className="line-clamp-2 text-t-13 text-fg-2">{question.bodyPreview}</p>

      <div className="mt-1 flex flex-wrap items-center gap-sp-3 text-t-12 text-fg-3">
        <span className="inline-flex items-center gap-1.5">
          <Avatar
            size="sm"
            src={question.author.avatarUrl ?? undefined}
            alt={question.author.name}
            initials={initialsOf(question.author.name)}
            className="h-5 w-5 text-[10px]"
          />
          {question.author.name}
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon icon={MessageSquare} size={13} />
          {question.answersCount} ta javob
        </span>
        <span>{formatRelativeTime(question.lastActivityAt)}</span>
      </div>
    </button>
  );
}
