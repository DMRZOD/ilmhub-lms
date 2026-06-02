import { api } from "@/lib/api-client";

import {
  answerSchema,
  questionDetailSchema,
  questionListResponseSchema,
  resolveResponseSchema,
  voteResponseSchema,
  type Answer,
  type CreateQuestionInput,
  type ListQuestionsParams,
  type QuestionDetail,
  type QuestionListResponse,
} from "./types";

function toParams(p: ListQuestionsParams): Record<string, string | number> {
  const params: Record<string, string | number> = { courseId: p.courseId };
  if (p.lessonId) params.lessonId = p.lessonId;
  if (p.sort) params.sort = p.sort;
  if (p.mine) params.mine = "true";
  if (p.instructorAnswered) params.instructorAnswered = "true";
  if (p.page) params.page = p.page;
  if (p.limit) params.limit = p.limit;
  return params;
}

export async function fetchQuestions(
  params: ListQuestionsParams,
): Promise<QuestionListResponse> {
  const { data } = await api.get("/questions", { params: toParams(params) });
  return questionListResponseSchema.parse(data);
}

export async function fetchQuestion(id: string): Promise<QuestionDetail> {
  const { data } = await api.get(`/questions/${encodeURIComponent(id)}`);
  return questionDetailSchema.parse(data);
}

export async function createQuestion(
  input: CreateQuestionInput,
): Promise<QuestionDetail> {
  const { data } = await api.post("/questions", input);
  return questionDetailSchema.parse(data);
}

export async function createAnswer(
  questionId: string,
  body: string,
): Promise<Answer> {
  const { data } = await api.post(
    `/questions/${encodeURIComponent(questionId)}/answers`,
    { body },
  );
  return answerSchema.parse(data);
}

export async function resolveQuestion(questionId: string) {
  const { data } = await api.patch(
    `/questions/${encodeURIComponent(questionId)}/resolve`,
  );
  return resolveResponseSchema.parse(data);
}

export async function voteAnswer(answerId: string, direction: 1 | -1) {
  const { data } = await api.post(
    `/answers/${encodeURIComponent(answerId)}/vote`,
    { direction },
  );
  return voteResponseSchema.parse(data);
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await api.delete(`/questions/${encodeURIComponent(questionId)}`);
}

export async function deleteAnswer(answerId: string): Promise<void> {
  await api.delete(`/answers/${encodeURIComponent(answerId)}`);
}
