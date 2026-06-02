import { api } from "@/lib/api-client";

import type {
  CodingExerciseDetail,
  SolutionResponse,
  SubmissionHistoryItem,
  SubmitCodeInput,
  SubmitCodeResult,
} from "./coding-types";

export async function fetchCodingExercise(
  lessonId: string,
): Promise<CodingExerciseDetail> {
  const { data } = await api.get<CodingExerciseDetail>(
    `/lessons/${encodeURIComponent(lessonId)}/coding`,
  );
  return data;
}

export async function submitCode(
  exerciseId: string,
  body: SubmitCodeInput,
): Promise<SubmitCodeResult> {
  const { data } = await api.post<SubmitCodeResult>(
    `/coding-exercises/${encodeURIComponent(exerciseId)}/submit`,
    body,
  );
  return data;
}

export async function fetchSolutionCode(
  exerciseId: string,
): Promise<SolutionResponse> {
  const { data } = await api.get<SolutionResponse>(
    `/coding-exercises/${encodeURIComponent(exerciseId)}/solution`,
  );
  return data;
}

export async function fetchMySubmissions(
  exerciseId: string,
): Promise<SubmissionHistoryItem[]> {
  const { data } = await api.get<SubmissionHistoryItem[]>(
    `/me/coding-submissions/${encodeURIComponent(exerciseId)}`,
  );
  return data;
}
