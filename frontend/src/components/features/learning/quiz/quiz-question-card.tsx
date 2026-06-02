"use client";

import * as React from "react";
import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import { QUIZ_TEXT } from "@/features/learning/quiz-labels";
import type { QuizQuestionPublic } from "@/features/learning/quiz-types";

export interface AnswerValue {
  selectedOptionIds: string[];
  textAnswer: string;
}

export function QuizQuestionCard({
  question,
  value,
  onChange,
}: {
  question: QuizQuestionPublic;
  value: AnswerValue;
  onChange: (next: AnswerValue) => void;
}) {
  const isMultiple = question.type === "MULTIPLE";

  const toggleOption = (optionId: string) => {
    if (question.type === "SINGLE") {
      onChange({ ...value, selectedOptionIds: [optionId] });
      return;
    }
    // MULTIPLE
    const set = new Set(value.selectedOptionIds);
    if (set.has(optionId)) set.delete(optionId);
    else set.add(optionId);
    onChange({ ...value, selectedOptionIds: [...set] });
  };

  return (
    <div className="flex flex-col gap-sp-4">
      <h2 className="text-t-24 font-extrabold tracking-ilm-tight text-ilm-ink">
        {question.text}
      </h2>

      {isMultiple ? (
        <p className="text-t-12 font-semibold uppercase tracking-wider text-fg-3">
          {QUIZ_TEXT.multipleHint}
        </p>
      ) : null}

      {question.type === "TEXT" ? (
        <textarea
          value={value.textAnswer}
          onChange={(e) => onChange({ ...value, textAnswer: e.target.value })}
          placeholder={QUIZ_TEXT.textPlaceholder}
          rows={4}
          className="w-full resize-y rounded-ilm-xl bg-ilm-surface px-sp-4 py-sp-3 text-t-16 text-ilm-ink outline-none ring-1 ring-transparent transition-shadow placeholder:text-fg-3 focus:ring-ilm-ink"
        />
      ) : (
        <div className="flex flex-col gap-sp-3">
          {question.options.map((option) => {
            const selected = value.selectedOptionIds.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleOption(option.id)}
                className={cn(
                  "flex items-center gap-sp-3 rounded-ilm-xl border px-sp-4 py-sp-3 text-left text-t-16 transition-colors",
                  selected
                    ? "border-ilm-ink bg-ilm-surface text-ilm-ink"
                    : "border-ilm-border bg-ilm-paper text-fg-1 hover:border-ilm-ink/40",
                )}
                aria-pressed={selected}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-content-center border text-white transition-colors",
                    isMultiple ? "rounded-md" : "rounded-full",
                    selected
                      ? "border-ilm-ink bg-ilm-ink"
                      : "border-ilm-border bg-transparent",
                  )}
                >
                  {selected ? (
                    isMultiple ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-2.5 w-2.5 fill-white" />
                    )
                  ) : null}
                </span>
                <span>{option.text}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
