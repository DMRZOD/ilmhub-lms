"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, HelpCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QUIZ_TEXT } from "@/features/learning/quiz-labels";
import type { QuizDetail } from "@/features/learning/quiz-types";

export function QuizIntro({
  quiz,
  title,
  description,
  onStart,
  onNextLesson,
}: {
  quiz: QuizDetail;
  title: string;
  description: string | null;
  onStart: () => void;
  onNextLesson?: () => void;
}) {
  const unlimited = quiz.attemptsAllowed === 0;
  const remaining = quiz.myAttempts.remaining;
  const passed = quiz.myAttempts.passed;
  const noAttemptsLeft = !unlimited && remaining === 0 && !passed;
  const canAttempt = !noAttemptsLeft;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card padding="lg" className="flex flex-col items-center gap-sp-5 text-center">
        <div className="grid h-16 w-16 place-content-center rounded-ilm-2xl bg-ilm-ink text-white">
          <HelpCircle className="h-8 w-8" />
        </div>

        <div className="flex flex-col gap-sp-2">
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            {title}
          </h1>
          {description ? (
            <p className="max-w-xl text-t-16 text-fg-2">{description}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-sp-1 text-t-16 text-fg-1">
          <p>{QUIZ_TEXT.introQuestionsCount(quiz.questionCount)}</p>
          <p>{QUIZ_TEXT.introPassing(quiz.passingScore)}</p>
          <p>
            {unlimited
              ? QUIZ_TEXT.introAttemptsUnlimited
              : QUIZ_TEXT.introAttempts(quiz.attemptsAllowed)}
          </p>
        </div>

        <p className="text-t-14 font-semibold text-fg-3">
          {unlimited
            ? QUIZ_TEXT.introAttemptsUsedUnlimited(quiz.myAttempts.used)
            : QUIZ_TEXT.introAttemptsUsed(
                quiz.myAttempts.used,
                quiz.attemptsAllowed,
              )}
        </p>

        {passed ? (
          <div className="flex items-center gap-sp-2 rounded-ilm-xl bg-ilm-success-bg px-sp-4 py-sp-3 text-t-14 font-semibold text-ilm-success">
            <CheckCircle2 className="h-5 w-5" />
            {QUIZ_TEXT.alreadyPassed}
          </div>
        ) : null}

        {noAttemptsLeft ? (
          <div className="rounded-ilm-xl bg-ilm-error-bg px-sp-4 py-sp-3 text-t-14 font-semibold text-ilm-error">
            {QUIZ_TEXT.noAttemptsLeft}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-sp-3">
          {canAttempt ? (
            <Button
              variant="primary"
              size="lg"
              iconRight={passed ? RotateCcw : ArrowRight}
              onClick={onStart}
            >
              {passed ? QUIZ_TEXT.retry : QUIZ_TEXT.start}
            </Button>
          ) : null}
          {onNextLesson && (passed || noAttemptsLeft) ? (
            <Button
              variant={passed ? "secondary" : "primary"}
              size="lg"
              iconRight={ArrowRight}
              onClick={onNextLesson}
            >
              {QUIZ_TEXT.nextLesson}
            </Button>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
}
