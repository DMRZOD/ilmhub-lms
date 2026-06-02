"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { coursesKeys, learningKeys, studentKeys } from "@/lib/query-keys";

import { fetchMyAttempts, fetchQuiz, submitQuizAttempt } from "./quiz-api";
import type { SubmitAttemptInput } from "./quiz-types";

export function useQuiz(lessonId: string | undefined) {
  return useQuery({
    queryKey: learningKeys.quiz(lessonId ?? ""),
    queryFn: () => fetchQuiz(lessonId as string),
    enabled: Boolean(lessonId),
    staleTime: 30 * 1000,
  });
}

export function useMyAttempts(quizId: string | undefined) {
  return useQuery({
    queryKey: learningKeys.quizAttempts(quizId ?? ""),
    queryFn: () => fetchMyAttempts(quizId as string),
    enabled: Boolean(quizId),
  });
}

/**
 * Submits an attempt. On a passing attempt the backend completes the lesson, so
 * we invalidate the lesson + enrollment + course caches to reflect progress.
 */
export function useSubmitAttempt(quizId: string, lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmitAttemptInput) => submitQuizAttempt(quizId, body),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: learningKeys.quizAttempts(quizId) });
      qc.invalidateQueries({ queryKey: learningKeys.quiz(lessonId) });
      if (result.passed) {
        qc.invalidateQueries({ queryKey: learningKeys.lesson(lessonId) });
        qc.invalidateQueries({ queryKey: studentKeys.enrollmentsRoot() });
        qc.invalidateQueries({ queryKey: coursesKeys.details() });
      }
    },
  });
}
