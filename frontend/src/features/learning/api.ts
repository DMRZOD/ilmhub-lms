import { api } from "@/lib/api-client";

import type {
  LessonDetail,
  PlaybackTokenResponse,
  ProgressDto,
} from "./types";

export async function fetchLesson(id: string): Promise<LessonDetail> {
  const { data } = await api.get<LessonDetail>(
    `/lessons/${encodeURIComponent(id)}`,
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
