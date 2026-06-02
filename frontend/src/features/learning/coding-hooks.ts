"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { coursesKeys, learningKeys, studentKeys } from "@/lib/query-keys";

import {
  fetchCodingExercise,
  fetchMySubmissions,
  submitCode,
} from "./coding-api";
import type { SubmitCodeInput } from "./coding-types";

export function useCodingExercise(lessonId: string | undefined) {
  return useQuery({
    queryKey: learningKeys.coding(lessonId ?? ""),
    queryFn: () => fetchCodingExercise(lessonId as string),
    enabled: Boolean(lessonId),
    staleTime: 30 * 1000,
  });
}

export function useMySubmissions(exerciseId: string | undefined) {
  return useQuery({
    queryKey: learningKeys.codingSubmissions(exerciseId ?? ""),
    queryFn: () => fetchMySubmissions(exerciseId as string),
    enabled: Boolean(exerciseId),
  });
}

export function useSubmitCode(exerciseId: string, lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmitCodeInput) => submitCode(exerciseId, body),
    onSuccess: (result) => {
      qc.invalidateQueries({
        queryKey: learningKeys.codingSubmissions(exerciseId),
      });
      if (result.passed) {
        qc.invalidateQueries({ queryKey: learningKeys.lesson(lessonId) });
        qc.invalidateQueries({ queryKey: studentKeys.enrollmentsRoot() });
        qc.invalidateQueries({ queryKey: coursesKeys.details() });
      }
    },
  });
}
