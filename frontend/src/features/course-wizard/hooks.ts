"use client";

import { useCallback, useRef, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as api from "./api";
import { courseWizardKeys } from "./keys";
import type { CourseStatus, WizardCourse } from "./schemas";

export function useMyCourses(status?: CourseStatus) {
  return useQuery({
    queryKey: courseWizardKeys.list(status),
    queryFn: () => api.fetchMyCourses(status),
  });
}

export function useWizardCourse(id: string) {
  return useQuery({
    queryKey: courseWizardKeys.detail(id),
    queryFn: () => api.fetchWizardCourse(id),
    enabled: Boolean(id),
    // Poll while any video is still uploading/processing so "Qayta ishlanyapti…"
    // flips to READY on its own once the Mux webhook lands.
    refetchInterval: (query) => {
      const course = query.state.data as WizardCourse | undefined;
      if (!course) return false;
      const processing = course.sections.some((s) =>
        s.lessons.some(
          (l) =>
            l.muxAssetStatus === "UPLOADING" ||
            l.muxAssetStatus === "PROCESSING",
        ),
      );
      return processing ? 4000 : false;
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCourse(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: courseWizardKeys.lists() }),
  });
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced (500ms) course field auto-save. Pending partial payloads are merged
 * so quick edits to different fields are never lost.
 */
export function useCourseAutosave(id: string) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<api.UpdateCoursePayload>({});

  const flush = useCallback(async () => {
    const body = pending.current;
    pending.current = {};
    if (Object.keys(body).length === 0) return;
    try {
      const course = await api.updateCourse(id, body);
      qc.setQueryData<WizardCourse>(courseWizardKeys.detail(id), course);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [id, qc]);

  const save = useCallback(
    (payload: api.UpdateCoursePayload) => {
      pending.current = { ...pending.current, ...payload };
      setStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 500);
    },
    [flush],
  );

  return { save, status };
}

/** Curriculum mutations — each refetches the wizard course on success. */
export function useCurriculum(courseId: string) {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: courseWizardKeys.detail(courseId) });

  const addSection = useMutation({
    mutationFn: (title: string) => api.addSection(courseId, title),
    onSuccess: invalidate,
  });
  const renameSection = useMutation({
    mutationFn: (v: { sectionId: string; title: string }) =>
      api.updateSection(v.sectionId, v.title),
    onSuccess: invalidate,
  });
  const removeSection = useMutation({
    mutationFn: (sectionId: string) => api.deleteSection(sectionId),
    onSuccess: invalidate,
  });
  const reorderSections = useMutation({
    mutationFn: (orderedIds: string[]) =>
      api.reorderSections(courseId, orderedIds),
    onSuccess: invalidate,
  });
  const addLesson = useMutation({
    mutationFn: (v: {
      sectionId: string;
      title: string;
      type: Parameters<typeof api.addLesson>[2];
    }) => api.addLesson(v.sectionId, v.title, v.type),
    onSuccess: invalidate,
  });
  const updateLesson = useMutation({
    mutationFn: (v: { lessonId: string; payload: api.UpdateLessonPayload }) =>
      api.updateLesson(v.lessonId, v.payload),
    onSuccess: invalidate,
  });
  const removeLesson = useMutation({
    mutationFn: (lessonId: string) => api.deleteLesson(lessonId),
    onSuccess: invalidate,
  });
  const reorderLessons = useMutation({
    mutationFn: (v: { sectionId: string; orderedIds: string[] }) =>
      api.reorderLessons(v.sectionId, v.orderedIds),
    onSuccess: invalidate,
  });

  return {
    addSection,
    renameSection,
    removeSection,
    reorderSections,
    addLesson,
    updateLesson,
    removeLesson,
    reorderLessons,
  };
}

/**
 * Lesson content authoring (steps 5–8): article/resources, coding, quizzes,
 * and submit-for-review. Each mutation refetches the wizard course so the
 * hydrated tree (and the publish checklist) stay in sync.
 */
export function useLessonAuthoring(courseId: string) {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: courseWizardKeys.detail(courseId) });

  const updateContent = useMutation({
    mutationFn: (v: { lessonId: string; payload: api.LessonContentPayload }) =>
      api.updateLessonContent(v.lessonId, v.payload),
    onSuccess: invalidate,
  });

  const upsertCoding = useMutation({
    mutationFn: (v: { lessonId: string; payload: api.CodingPayload }) =>
      api.upsertCoding(v.lessonId, v.payload),
    onSuccess: invalidate,
  });

  const upsertQuiz = useMutation({
    mutationFn: (v: {
      lessonId: string;
      settings: { passingScore: number; attemptsAllowed: number };
    }) => api.upsertQuiz(v.lessonId, v.settings),
    onSuccess: invalidate,
  });

  const addQuestion = useMutation({
    mutationFn: (v: { lessonId: string; payload: api.QuizQuestionPayload }) =>
      api.addQuizQuestion(v.lessonId, v.payload),
    onSuccess: invalidate,
  });

  const updateQuestion = useMutation({
    mutationFn: (v: {
      questionId: string;
      payload: Partial<api.QuizQuestionPayload>;
    }) => api.updateQuizQuestion(v.questionId, v.payload),
    onSuccess: invalidate,
  });

  const removeQuestion = useMutation({
    mutationFn: (questionId: string) => api.deleteQuizQuestion(questionId),
    onSuccess: invalidate,
  });

  const reorderQuestions = useMutation({
    mutationFn: (v: { lessonId: string; orderedIds: string[] }) =>
      api.reorderQuizQuestions(v.lessonId, v.orderedIds),
    onSuccess: invalidate,
  });

  return {
    invalidate,
    updateContent,
    upsertCoding,
    upsertQuiz,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,
  };
}

export function useSubmitForReview(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.submitForReview(courseId),
    onSuccess: (course) => {
      qc.setQueryData<WizardCourse>(courseWizardKeys.detail(courseId), course);
      qc.invalidateQueries({ queryKey: courseWizardKeys.lists() });
    },
  });
}
