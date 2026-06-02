import { api } from "@/lib/api-client";

import type {
  AttemptHistoryItem,
  AttemptResult,
  QuizDetail,
  SubmitAttemptInput,
} from "./quiz-types";

export async function fetchQuiz(lessonId: string): Promise<QuizDetail> {
  const { data } = await api.get<QuizDetail>(
    `/lessons/${encodeURIComponent(lessonId)}/quiz`,
  );
  return data;
}

export async function submitQuizAttempt(
  quizId: string,
  body: SubmitAttemptInput,
): Promise<AttemptResult> {
  const { data } = await api.post<AttemptResult>(
    `/quizzes/${encodeURIComponent(quizId)}/attempts`,
    body,
  );
  return data;
}

export async function fetchMyAttempts(
  quizId: string,
): Promise<AttemptHistoryItem[]> {
  const { data } = await api.get<AttemptHistoryItem[]>(
    `/me/quizzes/${encodeURIComponent(quizId)}/attempts`,
  );
  return data;
}
