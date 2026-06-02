"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";
import type { Answer } from "@/features/qa/types";
import { formatRelativeTime, initialsOf } from "@/features/qa/utils";

interface Props {
  answer: Answer;
  canDelete: boolean;
  onVote: (direction: 1 | -1) => void;
  onDelete: () => void;
  voting?: boolean;
}

export function AnswerItem({
  answer,
  canDelete,
  onVote,
  onDelete,
  voting,
}: Props) {
  return (
    <div
      className={cn(
        "flex gap-sp-3 rounded-ilm-2xl border bg-ilm-paper p-sp-4",
        answer.isInstructorAnswer
          ? "border-ilm-ink/30 bg-ilm-surface"
          : "border-ilm-border",
      )}
    >
      <div className="flex flex-col items-center gap-1 pt-1">
        <button
          type="button"
          aria-label="Foydali"
          disabled={voting}
          onClick={() => onVote(1)}
          className="grid h-7 w-7 place-items-center rounded-ilm-full text-fg-2 transition-colors hover:bg-ilm-surface hover:text-ilm-ink disabled:opacity-50"
        >
          <Icon icon={ChevronUp} size={16} />
        </button>
        <span className="text-t-13 font-bold tabular-nums text-ilm-ink">
          {answer.votesCount}
        </span>
        <button
          type="button"
          aria-label="Foydasiz"
          disabled={voting}
          onClick={() => onVote(-1)}
          className="grid h-7 w-7 place-items-center rounded-ilm-full text-fg-2 transition-colors hover:bg-ilm-surface hover:text-ilm-ink disabled:opacity-50"
        >
          <Icon icon={ChevronDown} size={16} />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-sp-2 flex flex-wrap items-center gap-sp-2">
          <Avatar
            size="sm"
            src={answer.author.avatarUrl ?? undefined}
            alt={answer.author.name}
            initials={initialsOf(answer.author.name)}
          />
          <span className="text-t-13 font-semibold text-ilm-ink">
            {answer.author.name}
          </span>
          {answer.isInstructorAnswer && <Badge tone="info">Ustoz</Badge>}
          <span className="text-t-12 text-fg-3">
            {formatRelativeTime(answer.createdAt)}
          </span>
          {canDelete && (
            <button
              type="button"
              aria-label="O'chirish"
              onClick={onDelete}
              className="ml-auto grid h-7 w-7 place-items-center rounded-ilm-full text-fg-3 transition-colors hover:bg-ilm-error-bg hover:text-ilm-error"
            >
              <Icon icon={Trash2} size={14} />
            </button>
          )}
        </div>
        <Markdown>{answer.body}</Markdown>
      </div>
    </div>
  );
}
