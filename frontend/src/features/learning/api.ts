import { api } from "@/lib/api-client";

import type {
  LessonDetail,
  LessonPreviewResponse,
  PlaybackTokenResponse,
  ProgressDto,
} from "./types";

export async function fetchLesson(id: string): Promise<LessonDetail> {
  const { data } = await api.get<LessonDetail>(
    `/lessons/${encodeURIComponent(id)}`,
  );
  return data;
}

/** Public free-preview playback for a lesson — works for anonymous viewers. */
export async function fetchLessonPreview(
  id: string,
): Promise<LessonPreviewResponse> {
  const { data } = await api.get<LessonPreviewResponse>(
    `/lessons/${encodeURIComponent(id)}/preview`,
  );
  return data;
}

export async function fetchPlaybackToken(
  id: string,
): Promise<PlaybackTokenResponse> {
  const { data } = await api.post<PlaybackTokenResponse>(
    `/lessons/${encodeURIComponent(id)}/playback-token`,
  );
  return data;
}

export async function postLessonProgress(
  id: string,
  body: ProgressDto,
): Promise<void> {
  await api.post(`/lessons/${encodeURIComponent(id)}/progress`, body);
}
