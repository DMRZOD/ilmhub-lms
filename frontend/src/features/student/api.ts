import { api } from "@/lib/api-client";
import {
  courseListResponseSchema,
  enrolledCoursesResponseSchema,
  type CourseListResponse,
  type EnrolledCoursesResponse,
  type EnrollmentFiltersInput,
  type FavoritesFiltersInput,
} from "@/types/api";

import type {
  AchievementsResponse,
  CertificatesResponse,
  DashboardResponse,
  NotificationListResponse,
} from "./types";

export interface EnrollResponse {
  id: string;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  alreadyEnrolled: boolean;
  firstLessonId: string | null;
  nextLessonId: string | null;
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>("/users/me/dashboard");
  return data;
}

export async function fetchNotifications(params?: {
  cursor?: string;
  take?: number;
}): Promise<NotificationListResponse> {
  const { data } = await api.get<NotificationListResponse>(
    "/users/me/notifications",
    { params },
  );
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/users/me/notifications/${id}`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch(`/users/me/notifications`);
}

function toEnrollmentParams(
  filters: EnrollmentFiltersInput,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (filters.page != null) out.page = filters.page;
  if (filters.limit != null) out.limit = filters.limit;
  if (filters.status) out.status = filters.status;
  if (filters.sort) out.sort = filters.sort;
  return out;
}

export async function fetchMyEnrollments(
  filters: EnrollmentFiltersInput = {},
): Promise<EnrolledCoursesResponse> {
  const { data } = await api.get("/me/enrollments", {
    params: toEnrollmentParams(filters),
  });
  return enrolledCoursesResponseSchema.parse(data);
}

export async function enrollInCourse(
  courseId: string,
): Promise<EnrollResponse> {
  const { data } = await api.post<EnrollResponse>("/enrollments", {
    courseId,
  });
  return data;
}

export async function fetchMyFavorites(
  filters: FavoritesFiltersInput = {},
): Promise<CourseListResponse> {
  const params: Record<string, unknown> = {};
  if (filters.page != null) params.page = filters.page;
  if (filters.limit != null) params.limit = filters.limit;
  const { data } = await api.get("/me/favorites", { params });
  return courseListResponseSchema.parse(data);
}

export async function addFavorite(courseId: string): Promise<void> {
  await api.post(`/favorites/${encodeURIComponent(courseId)}`);
}

export async function removeFavorite(courseId: string): Promise<void> {
  await api.delete(`/favorites/${encodeURIComponent(courseId)}`);
}

export async function fetchMyCertificates(): Promise<CertificatesResponse> {
  const { data } = await api.get<CertificatesResponse>("/me/certificates");
  return data;
}

export async function downloadCertificatePdf(id: string): Promise<Blob> {
  const { data } = await api.post<Blob>(
    `/certificates/${encodeURIComponent(id)}/download`,
    undefined,
    { responseType: "blob" },
  );
  return data;
}

export async function fetchMyAchievements(): Promise<AchievementsResponse> {
  const { data } = await api.get<AchievementsResponse>("/me/achievements");
  return data;
}
