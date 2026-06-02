"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuiz, useSubmitAttempt } from "@/features/learning/quiz-hooks";
import { QUIZ_TEXT } from "@/features/learning/quiz-labels";
import type {
  AttemptResult,
  QuizQuestionPublic,
} from "@/features/learning/quiz-types";
import type { LessonDetail } from "@/features/learning/types";

import { QuizIntro } from "./quiz-intro";
import { QuizQuestionCard, type AnswerValue } from "./quiz-question-card";
import { QuizResult } from "./quiz-result";

type Phase = "intro" | "quiz" | "result";

const EMPTY_ANSWER: AnswerValue = { selectedOptionIds: [], textAnswer: "" };

function isAnswered(question: QuizQuestionPublic, value: AnswerValue): boolean {
  if (question.type === "TEXT") return value.textAnswer.trim().length > 0;
  return value.selectedOptionIds.length > 0;
}

export function QuizView({
  lessonId,
  lesson,
}: {
  lessonId: string;
  lesson: LessonDetail;
}) {
  const router = useRouter();
  const quizQuery = useQuiz(lessonId);
  const quiz = quizQuery.data;
  const submit = useSubmitAttempt(quiz?.id ?? "", lessonId);

  const [phase, setPhase] = React.useState<Phase>("intro");
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [answers, setAnswers] = React.useState<Record<string, AnswerValue>>({});
  const [result, setResult] = React.useState<AttemptResult | null>(null);

  const nextLessonId = lesson.navigation.nextLessonId;
  const goNextLesson = React.useCallback(() => {
    if (nextLessonId) router.push(`/lesson/${nextLessonId}`);
  }, [nextLessonId, router]);

  const startQuiz = React.useCallback(() => {
    setAnswers({});
    setIndex(0);
    setDirection(1);
    setResult(null);
    setPhase("quiz");
  }, []);

  if (quizQuery.isLoading) {
    return (
      <div className="grid min-h-[320px] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-ilm-ink" />
      </div>
    );
  }

  if (quizQuery.isError || !quiz) {
    const status = isAxiosError(quizQuery.error)
      ? quizQuery.error.response?.status
      : undefined;
    return (
      <Card padding="lg" className="text-center text-t-16 text-fg-2">
        {status === 404 ? QUIZ_TEXT.notFound : QUIZ_TEXT.loadError}
      </Card>
    );
  }

  if (phase === "intro") {
    return (
      <QuizIntro
        quiz={quiz}
        title={lesson.title}
        description={lesson.description}
        onStart={startQuiz}
        onNextLesson={nextLessonId ? goNextLesson : undefined}
      />
    );
  }

  if (phase === "result" && result) {
    return (
      <QuizResult
        result={result}
        questions={quiz.questions}
        onRetry={startQuiz}
        onNextLesson={nextLessonId ? goNextLesson : undefined}
      />
    );
  }

  // phase === "quiz"
  const questions = quiz.questions;
  const total = questions.length;
  const question = questions[index];
  const value = answers[question.id] ?? EMPTY_ANSWER;
  const answered = isAnswered(question, value);
  const isLast = index === total - 1;

  const setValue = (next: AnswerValue) =>
    setAnswers((prev) => ({ ...prev, [question.id]: next }));

  const goPrev = () => {
    if (index === 0) return;
    setDirection(-1);
    setIndex((i) => i - 1);
  };
  const goNext = () => {
    if (index >= total - 1) return;
    setDirection(1);
    setIndex((i) => i + 1);
  };

  const handleFinish = () => {
    const payload = {
      answers: questions.map((q) => {
        const a = answers[q.id] ?? EMPTY_ANSWER;
        return q.type === "TEXT"
          ? { questionId: q.id, textAnswer: a.textAnswer }
          : { questionId: q.id, selectedOptionIds: a.selectedOptionIds };
      }),
    };
    submit.mutate(payload, {
      onSuccess: (res) => {
        setResult(res);
        setPhase("result");
      },
      onError: (err) => {
        if (isAxiosError(err) && err.response?.status === 403) {
          toast.error(QUIZ_TEXT.noAttemptsLeft);
          setPhase("intro");
          return;
        }
        toast.error(QUIZ_TEXT.submitError);
      },
    });
  };

  return (
    <div className="flex flex-col gap-sp-5">
      <div className="flex flex-col gap-sp-2">
        <div className="flex items-center justify-between text-t-14 font-semibold text-fg-2">
          <span>{QUIZ_TEXT.progress(index + 1, total)}</span>
          <span>{Math.round(((index + 1) / total) * 100)}%</span>
        </div>
        <Progress value={((index + 1) / total) * 100} />
      </div>

      <Card padding="lg" className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 48 : -48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -48 : 48 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <QuizQuestionCard
              question={question}
              value={value}
              onChange={setValue}
            />
          </motion.div>
        </AnimatePresence>
      </Card>

      <div className="flex items-center justify-between gap-sp-3">
        <Button
          variant="secondary"
          size="md"
          iconLeft={ArrowLeft}
          disabled={index === 0 || submit.isPending}
          onClick={goPrev}
        >
          {QUIZ_TEXT.prev}
        </Button>

        {isLast ? (
          <Button
            variant="primary"
            size="md"
            iconRight={CheckCircle2}
            disabled={!answered || submit.isPending}
            onClick={handleFinish}
          >
            {submit.isPending ? QUIZ_TEXT.submitting : QUIZ_TEXT.finish}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            iconRight={ArrowRight}
            disabled={!answered}
            onClick={goNext}
          >
            {QUIZ_TEXT.next}
          </Button>
        )}
      </div>
    </div>
  );
}
