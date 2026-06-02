"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QUIZ_TEXT } from "@/features/learning/quiz-labels";
import type {
  AttemptResult,
  QuizQuestionPublic,
} from "@/features/learning/quiz-types";

export function QuizResult({
  result,
  questions,
  onRetry,
  onNextLesson,
}: {
  result: AttemptResult;
  questions: QuizQuestionPublic[];
  onRetry: () => void;
  onNextLesson?: () => void;
}) {
  const questionMap = React.useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions],
  );
  const canRetry = result.attemptsRemaining === null || result.attemptsRemaining > 0;

  // Map an option id to its display text (falls back to the raw id for TEXT answers).
  const optionText = (question: QuizQuestionPublic | undefined, id: string) =>
    question?.options.find((o) => o.id === id)?.text ?? id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-sp-5"
    >
      <Card
        padding="lg"
        className={cn(
          "flex flex-col items-center gap-sp-3 text-center",
          result.passed ? "bg-ilm-success-bg" : "bg-ilm-error-bg",
        )}
      >
        {result.passed ? (
          <CheckCircle2 className="h-12 w-12 text-ilm-success" />
        ) : (
          <XCircle className="h-12 w-12 text-ilm-error" />
        )}
        <h1
          className={cn(
            "text-t-32 font-extrabold tracking-ilm-tight",
            result.passed ? "text-ilm-success" : "text-ilm-error",
          )}
        >
          {result.passed
            ? QUIZ_TEXT.resultPassedTitle
            : QUIZ_TEXT.resultFailedTitle}
        </h1>
        <p className="text-t-24 font-extrabold text-ilm-ink">
          {QUIZ_TEXT.yourScore(result.score)}
        </p>
        <p className="text-t-14 text-fg-2">
          {QUIZ_TEXT.passingScore(result.passingScore)}
        </p>
        {result.attemptsRemaining !== null ? (
          <p className="text-t-14 font-semibold text-fg-3">
            {QUIZ_TEXT.attemptsRemaining(result.attemptsRemaining)}
          </p>
        ) : null}
      </Card>

      {result.revealed ? (
        <div className="flex flex-col gap-sp-3">
          <h2 className="text-t-18 font-bold text-ilm-ink">
            {QUIZ_TEXT.breakdownTitle}
          </h2>
          {result.questions.map((rq, idx) => {
            const question = questionMap.get(rq.questionId);
            const isText = question?.type === "TEXT";
            const yourAnswer = isText
              ? rq.yourTextAnswer || QUIZ_TEXT.noAnswer
              : rq.yourSelectedOptionIds.length > 0
                ? rq.yourSelectedOptionIds
                    .map((id) => optionText(question, id))
                    .join(", ")
                : QUIZ_TEXT.noAnswer;
            const correctAnswer = rq.correctAnswerIds
              .map((id) => (isText ? id : optionText(question, id)))
              .join(", ");

            return (
              <Card key={rq.questionId} padding="md" className="flex flex-col gap-sp-3">
                <div className="flex items-start gap-sp-3">
                  <span
                    className={cn(
                      "mt-0.5 grid h-6 w-6 shrink-0 place-content-center rounded-full text-white",
                      rq.correct ? "bg-ilm-success" : "bg-ilm-error",
                    )}
                  >
                    {rq.correct ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </span>
                  <div className="flex flex-1 flex-col gap-sp-2">
                    <p className="text-t-16 font-semibold text-ilm-ink">
                      {idx + 1}. {question?.text}
                    </p>
                    <p
                      className={cn(
                        "text-t-14",
                        rq.correct ? "text-ilm-success" : "text-ilm-error",
                      )}
                    >
                      <span className="font-semibold">
                        {QUIZ_TEXT.yourAnswer}{" "}
                      </span>
                      {yourAnswer}{" "}
                      <span className="font-semibold">
                        ({rq.correct ? QUIZ_TEXT.correct : QUIZ_TEXT.incorrect})
                      </span>
                    </p>
                    {!rq.correct ? (
                      <p className="text-t-14 text-fg-1">
                        <span className="font-semibold">
                          {QUIZ_TEXT.correctAnswer}{" "}
                        </span>
                        {correctAnswer}
                      </p>
                    ) : null}
                    {rq.explanation ? (
                      <p className="rounded-ilm-lg bg-ilm-surface px-sp-3 py-sp-2 text-t-14 text-fg-2">
                        <span className="font-semibold">
                          {QUIZ_TEXT.explanation}{" "}
                        </span>
                        {rq.explanation}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card padding="md" className="text-center text-t-14 text-fg-2">
          {QUIZ_TEXT.resultHiddenNote}
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-center gap-sp-3">
        {canRetry && !result.passed ? (
          <Button
            variant="primary"
            size="lg"
            iconLeft={RotateCcw}
            onClick={onRetry}
          >
            {QUIZ_TEXT.retry}
          </Button>
        ) : null}
        {onNextLesson && result.passed ? (
          <Button
            variant="primary"
            size="lg"
            iconRight={ArrowRight}
            onClick={onNextLesson}
          >
            {QUIZ_TEXT.nextLesson}
          </Button>
        ) : null}
        {canRetry && result.passed ? (
          <Button
            variant="secondary"
            size="lg"
            iconLeft={RotateCcw}
            onClick={onRetry}
          >
            {QUIZ_TEXT.retry}
          </Button>
        ) : null}
      </div>
    </motion.div>
  );
}
