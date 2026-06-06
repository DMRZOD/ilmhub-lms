"use client";

import { useCallback } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { learningKeys, studentKeys, coursesKeys } from "@/lib/query-keys";

import {
  fetchLesson,
  fetchLessonPreview,
  fetchPlaybackToken,
  postLessonProgress,
} from "./api";
import type { ProgressDto } from "./types";

export function useLesson(id: string | undefined) {
  return useQuery({
    queryKey: learningKeys.lesson(id ?? ""),
    queryFn: () => fetchLesson(id as string),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
    // Keep the previous lesson on screen while the next one loads, so switching
    // lessons never collapses the whole player into a full-screen spinner.
    placeholderData: keepPreviousData,
  });
}

/**
 * Returns a function that warms the cache for a lesson (detail only — the
 * heavy curriculum payload) so navigating to it is instant. Used for the
 * next/prev lessons and on sidebar hover.
 */
export function usePrefetchLesson() {
  const qc = useQueryClient();
  return useCallback(
    (id: string) => {
      if (!id) return;
      void qc.prefetchQuery({
        queryKey: learningKeys.lesson(id),
        queryFn: () => fetchLesson(id),
        staleTime: 30 * 1000,
      });
    },
    [qc],
  );
}

export function usePlaybackToken(id: string | undefined) {
  return useQuery({
    queryKey: learningKeys.playbackToken(id ?? ""),
    queryFn: () => fetchPlaybackToken(id as string),
    enabled: Boolean(id),
    staleTime: 50 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useLessonPreview(id: string | null | undefined) {
  return useQuery({
    queryKey: learningKeys.preview(id ?? ""),
    queryFn: () => fetchLessonPreview(id as string),
    enabled: Boolean(id),
    staleTime: 50 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateProgress(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProgressDto) => postLessonProgress(lessonId, body),
    onSuccess: (_data, variables) => {
      if (variables.completed) {
        qc.invalidateQueries({ queryKey: learningKeys.lesson(lessonId) });
        qc.invalidateQueries({ queryKey: studentKeys.enrollmentsRoot() });
        qc.invalidateQueries({ queryKey: coursesKeys.details() });
      }
    },
  });
}
