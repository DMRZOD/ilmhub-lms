"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { coursesKeys, studentKeys } from "@/lib/query-keys";
import type {
  CourseDetail,
  CourseListResponse,
  EnrollmentFiltersInput,
  FavoritesFiltersInput,
} from "@/types/api";

import {
  addFavorite,
  downloadCertificatePdf,
  enrollInCourse,
  fetchDashboard,
  fetchMyAchievements,
  fetchMyCertificates,
  fetchMyEnrollments,
  fetchMyFavorites,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  removeFavorite,
} from "./api";

export const dashboardQueryKey = ["student", "dashboard"] as const;
export const notificationsQueryKey = ["student", "notifications"] as const;

export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboard,
    staleTime: 60 * 1000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: () => fetchNotifications(),
    staleTime: 30 * 1000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });
}

export function useEnrollments(filters: EnrollmentFiltersInput = {}) {
  return useQuery({
    queryKey: studentKeys.enrollments(filters),
    queryFn: () => fetchMyEnrollments(filters),
    staleTime: 30 * 1000,
  });
}

export function useEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollInCourse,
    onSuccess: (_data, courseId) => {
      qc.invalidateQueries({ queryKey: studentKeys.enrollmentsRoot() });
      qc.invalidateQueries({ queryKey: coursesKeys.details() });
      qc.invalidateQueries({ queryKey: dashboardQueryKey });
      void courseId;
    },
  });
}

export function useFavorites(filters: FavoritesFiltersInput = {}) {
  return useQuery({
    queryKey: studentKeys.favorites(filters),
    queryFn: () => fetchMyFavorites(filters),
    staleTime: 30 * 1000,
  });
}

export interface ToggleFavoriteInput {
  courseId: string;
  slug?: string;
  nextFavorited: boolean;
}

interface ToggleSnapshot {
  detailKey: readonly unknown[] | null;
  previousDetail: CourseDetail | undefined;
  favoritesEntries: Array<
    readonly [readonly unknown[], CourseListResponse | undefined]
  >;
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation<void, unknown, ToggleFavoriteInput, ToggleSnapshot>({
    mutationFn: async ({ courseId, nextFavorited }) => {
      if (nextFavorited) {
        await addFavorite(courseId);
      } else {
        await removeFavorite(courseId);
      }
    },
    onMutate: async ({ courseId, slug, nextFavorited }) => {
      const detailKey = slug ? coursesKeys.detail(slug) : null;
      await qc.cancelQueries({ queryKey: studentKeys.favoritesRoot() });
      if (detailKey) await qc.cancelQueries({ queryKey: detailKey });

      const previousDetail = detailKey
        ? qc.getQueryData<CourseDetail>(detailKey)
        : undefined;
      if (detailKey && previousDetail) {
        qc.setQueryData<CourseDetail>(detailKey, {
          ...previousDetail,
          isFavorited: nextFavorited,
        });
      }

      const favoritesEntries = qc.getQueriesData<CourseListResponse>({
        queryKey: studentKeys.favoritesRoot(),
      });

      for (const [key, value] of favoritesEntries) {
        if (!value) continue;
        if (nextFavorited) {
          if (value.items.some((c) => c.id === courseId)) continue;
        } else {
          const filtered = value.items.filter((c) => c.id !== courseId);
          qc.setQueryData<CourseListResponse>(key, {
            items: filtered,
            meta: {
              ...value.meta,
              total: Math.max(0, value.meta.total - 1),
            },
          });
        }
      }

      return { detailKey, previousDetail, favoritesEntries };
    },
    onError: (_err, _vars, snapshot) => {
      if (!snapshot) return;
      if (snapshot.detailKey && snapshot.previousDetail) {
        qc.setQueryData(snapshot.detailKey, snapshot.previousDetail);
      }
      for (const [key, value] of snapshot.favoritesEntries) {
        qc.setQueryData(key, value);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: studentKeys.favoritesRoot() });
      qc.invalidateQueries({ queryKey: coursesKeys.details() });
    },
  });
}

export function useCertificates() {
  return useQuery({
    queryKey: studentKeys.certificates(),
    queryFn: fetchMyCertificates,
    staleTime: 60 * 1000,
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: studentKeys.achievements(),
    queryFn: fetchMyAchievements,
    staleTime: 60 * 1000,
  });
}

export interface DownloadCertificateInput {
  id: string;
  certificateNumber: string;
}

export function useDownloadCertificate() {
  return useMutation({
    mutationFn: async ({ id, certificateNumber }: DownloadCertificateInput) => {
      const blob = await downloadCertificatePdf(id);
      if (typeof window === "undefined") return;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ilmhub-${certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
