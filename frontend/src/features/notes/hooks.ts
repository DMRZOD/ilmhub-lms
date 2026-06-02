"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notesKeys } from "@/lib/query-keys";

import {
  createNote,
  deleteNote,
  fetchCourseNotes,
  fetchLessonNotes,
  updateNote,
} from "./api";
import type { CreateNoteInput, Note, UpdateNoteInput } from "./types";

export function useLessonNotes(lessonId: string | undefined) {
  return useQuery({
    queryKey: notesKeys.lesson(lessonId ?? ""),
    queryFn: () => fetchLessonNotes(lessonId as string),
    enabled: Boolean(lessonId),
    staleTime: 30 * 1000,
  });
}

export function useCourseNotes(courseId: string | undefined) {
  return useQuery({
    queryKey: notesKeys.course(courseId ?? ""),
    queryFn: () => fetchCourseNotes(courseId as string),
    enabled: Boolean(courseId),
    staleTime: 30 * 1000,
  });
}

type ListKey = readonly unknown[];
interface Snapshot {
  previous?: Note[];
}

/**
 * Create a note with an optimistic insert into `listKey`. The temporary note is
 * swapped for the server copy on success and rolled back on error. `notesKeys.all`
 * is invalidated on settle so the lesson panel and course overview stay in sync.
 */
export function useCreateNote(listKey: ListKey) {
  const qc = useQueryClient();
  return useMutation<
    Note,
    unknown,
    CreateNoteInput,
    Snapshot & { tempId: string }
  >({
    mutationFn: createNote,
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: listKey });
      const previous = qc.getQueryData<Note[]>(listKey);
      const tempId = `temp-${Date.now()}`;
      const now = new Date().toISOString();
      const optimistic: Note = {
        id: tempId,
        lessonId: input.lessonId,
        content: input.content,
        timestampSeconds: input.timestampSeconds ?? null,
        createdAt: now,
        updatedAt: now,
        lesson: null,
      };
      qc.setQueryData<Note[]>(listKey, [optimistic, ...(previous ?? [])]);
      return { previous, tempId };
    },
    onSuccess: (note, _input, ctx) => {
      qc.setQueryData<Note[]>(listKey, (current) =>
        (current ?? []).map((n) => (n.id === ctx?.tempId ? note : n)),
      );
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData(listKey, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notesKeys.all });
    },
  });
}

export function useUpdateNote(listKey: ListKey) {
  const qc = useQueryClient();
  return useMutation<
    Note,
    unknown,
    { id: string; input: UpdateNoteInput },
    Snapshot
  >({
    mutationFn: ({ id, input }) => updateNote(id, input),
    onMutate: async ({ id, input }) => {
      await qc.cancelQueries({ queryKey: listKey });
      const previous = qc.getQueryData<Note[]>(listKey);
      qc.setQueryData<Note[]>(listKey, (current) =>
        (current ?? []).map((n) =>
          n.id === id
            ? {
                ...n,
                content: input.content ?? n.content,
                timestampSeconds:
                  input.timestampSeconds === undefined
                    ? n.timestampSeconds
                    : input.timestampSeconds,
                updatedAt: new Date().toISOString(),
              }
            : n,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(listKey, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notesKeys.all });
    },
  });
}

export function useDeleteNote(listKey: ListKey) {
  const qc = useQueryClient();
  return useMutation<void, unknown, string, Snapshot>({
    mutationFn: deleteNote,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: listKey });
      const previous = qc.getQueryData<Note[]>(listKey);
      qc.setQueryData<Note[]>(listKey, (current) =>
        (current ?? []).filter((n) => n.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(listKey, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notesKeys.all });
    },
  });
}
