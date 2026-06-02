"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { qaKeys } from "@/lib/query-keys";

import {
  createAnswer,
  createQuestion,
  deleteAnswer,
  deleteQuestion,
  fetchQuestion,
  fetchQuestions,
  resolveQuestion,
  voteAnswer,
} from "./api";
import type {
  CreateQuestionInput,
  ListQuestionsParams,
  QuestionDetail,
} from "./types";

export function useQuestions(params: ListQuestionsParams, enabled = true) {
  return useQuery({
    queryKey: qaKeys.list({ ...params }),
    queryFn: () => fetchQuestions(params),
    enabled: enabled && Boolean(params.courseId),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useQuestion(id: string | undefined) {
  return useQuery({
    queryKey: qaKeys.detail(id ?? ""),
    queryFn: () => fetchQuestion(id as string),
    enabled: Boolean(id),
    staleTime: 15 * 1000,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuestionInput) => createQuestion(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qaKeys.lists() });
    },
  });
}

export function useCreateAnswer(questionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => createAnswer(questionId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qaKeys.detail(questionId) });
      qc.invalidateQueries({ queryKey: qaKeys.lists() });
    },
  });
}

export function useResolveQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => resolveQuestion(questionId),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: qaKeys.detail(res.id) });
      qc.invalidateQueries({ queryKey: qaKeys.lists() });
    },
  });
}

export function useVoteAnswer(questionId: string) {
  const qc = useQueryClient();
  const key = qaKeys.detail(questionId);
  return useMutation<
    { id: string; votesCount: number },
    unknown,
    { answerId: string; direction: 1 | -1 },
    { previous?: QuestionDetail }
  >({
    mutationFn: ({ answerId, direction }) => voteAnswer(answerId, direction),
    onMutate: async ({ answerId, direction }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<QuestionDetail>(key);
      if (previous) {
        qc.setQueryData<QuestionDetail>(key, {
          ...previous,
          answers: previous.answers.map((a) =>
            a.id === answerId
              ? { ...a, votesCount: a.votesCount + direction }
              : a,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => deleteQuestion(questionId),
    onSuccess: (_data, questionId) => {
      qc.invalidateQueries({ queryKey: qaKeys.detail(questionId) });
      qc.invalidateQueries({ queryKey: qaKeys.lists() });
    },
  });
}

export function useDeleteAnswer(questionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answerId: string) => deleteAnswer(answerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qaKeys.detail(questionId) });
      qc.invalidateQueries({ queryKey: qaKeys.lists() });
    },
  });
}
