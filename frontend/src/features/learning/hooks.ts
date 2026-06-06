"use client";

import { useCallback } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import { learningKeys, studentKeys, coursesKeys } from "@/lib/query-keys";

import {
  fetchLesson,
  fetchLessonPreview,
  fetchPlaybackToken,
  postLessonProgress,
} from "./api";
import type { LessonDetail, ProgressDto } from "./types";

/**
 * Returns a copy of a cached `LessonDetail` with `targetLessonId`'s completion
 * flipped in the embedded curriculum, the course `completedCount` /
 * `progressPercent` recomputed, and `myProgress.completed` flipped when the
 * target is this same lesson. Used to make completion (auto, manual button or a
 * sidebar checkbox) reflect instantly instead of waiting for a refetch.
 */
function patchLessonCompletion(
  lesson: LessonDetail,
  targetLessonId: string,
  completed: boolean,
): LessonDetail {
  const sections = lesson.course.sections.map((section) => ({
    ...section,
    lessons: section.lessons.map((l) =>
      l.id === targetLessonId ? { ...l, completed } : l,
    ),
  }));
  const completedCount = sections.reduce(
    (sum, s) => sum + s.lessons.filter((l) => l.completed).length,
    0,
  );
  const totalLessons = lesson.course.totalLessons;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return {
    ...lesson,
    myProgress:
      targetLessonId === lesson.id
        ? { ...lesson.myProgress, completed }
        : lesson.myProgress,
    course: { ...lesson.course, sections, completedCount, progressPercent },
  };
}

/**
 * Optimistically applies a completion change to the lesson cache the player is
 * rendering from (`currentLessonId`) and, if cached, the target lesson's own
 * payload. Returns a rollback thunk for the mutation's `onError`.
 */
function applyCompletionToCache(
  qc: QueryClient,
  currentLessonId: string,
  targetLessonId: string,
  completed: boolean,
): () => void {
  const keys = Array.from(
    new Set([
      learningKeys.lesson(currentLessonId),
      learningKeys.lesson(targetLessonId),
    ].map((k) => JSON.stringify(k))),
  ).map((k) => JSON.parse(k) as readonly unknown[]);

  const snapshots = keys.map(
    (key) => [key, qc.getQueryData<LessonDetail>(key)] as const,
  );

  for (const [key, prev] of snapshots) {
    if (prev) {
      qc.setQueryData<LessonDetail>(
        key,
        patchLessonCompletion(prev, targetLessonId, completed),
      );
    }
  }

  return () => {
    for (const [key, prev] of snapshots) {
      if (prev) qc.setQueryData(key, prev);
    }
  };
}

function invalidateAfterCompletion(qc: QueryClient, lessonId: string) {
  qc.invalidateQueries({ queryKey: learningKeys.lesson(lessonId) });
  qc.invalidateQueries({ queryKey: studentKeys.enrollmentsRoot() });
  qc.invalidateQueries({ queryKey: coursesKeys.details() });
}

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
    // Frequent position-only pings stay cheap; only a completion change touches
    // the cache, optimistically, so the sidebar check + header progress move now.
    onMutate: (variables) => {
      if (variables.completed === undefined) return undefined;
      const rollback = applyCompletionToCache(
        qc,
        lessonId,
        lessonId,
        variables.completed,
      );
      return { rollback };
    },
    onError: (_err, _variables, context) => {
      context?.rollback?.();
    },
    onSettled: (_data, _err, variables) => {
      if (variables.completed !== undefined) {
        invalidateAfterCompletion(qc, lessonId);
      }
    },
  });
}

/**
 * Toggles completion of any lesson in the curriculum from the sidebar checkbox
 * (Udemy-style). `currentLessonId` is the lesson the player is rendering from —
 * its cached payload owns the curriculum the sidebar shows, so it's patched
 * optimistically. No playback position is sent, so the target lesson's saved
 * position is preserved.
 */
export function useToggleLessonComplete(currentLessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      lessonId,
      completed,
    }: {
      lessonId: string;
      completed: boolean;
    }) => postLessonProgress(lessonId, { completed }),
    onMutate: async ({ lessonId, completed }) => {
      await qc.cancelQueries({
        queryKey: learningKeys.lesson(currentLessonId),
      });
      const rollback = applyCompletionToCache(
        qc,
        currentLessonId,
        lessonId,
        completed,
      );
      return { rollback };
    },
    onError: (_err, _variables, context) => {
      context?.rollback?.();
    },
    onSettled: () => {
      invalidateAfterCompletion(qc, currentLessonId);
    },
  });
}
