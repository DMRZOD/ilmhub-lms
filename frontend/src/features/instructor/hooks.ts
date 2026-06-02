"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  instructorAnnouncementKeys,
  instructorDashboardKeys,
  instructorReviewKeys,
  instructorRevenueKeys,
  instructorStudentKeys,
} from "@/lib/query-keys";

import {
  createAnnouncement,
  fetchInstructorAnnouncements,
  fetchInstructorDashboard,
  fetchInstructorRevenue,
  fetchInstructorReviews,
  fetchInstructorStudentDetail,
  fetchInstructorStudents,
  replyToReview,
  type CreateAnnouncementInput,
  type ReviewsParams,
  type StudentsParams,
} from "./api";

export function useInstructorDashboard() {
  return useQuery({
    queryKey: instructorDashboardKeys.root(),
    queryFn: fetchInstructorDashboard,
    staleTime: 60_000,
  });
}

// ---------- Students ----------

export function useInstructorStudents(params: StudentsParams, enabled = true) {
  return useQuery({
    queryKey: instructorStudentKeys.list(params),
    queryFn: () => fetchInstructorStudents(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useInstructorStudentDetail(studentId: string | undefined) {
  return useQuery({
    queryKey: instructorStudentKeys.detail(studentId ?? ""),
    queryFn: () => fetchInstructorStudentDetail(studentId as string),
    enabled: Boolean(studentId),
    staleTime: 30_000,
  });
}

// ---------- Reviews ----------

export function useInstructorReviews(params: ReviewsParams) {
  return useQuery({
    queryKey: instructorReviewKeys.list(params),
    queryFn: () => fetchInstructorReviews(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useReplyToReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, comment }: { reviewId: string; comment: string }) =>
      replyToReview(reviewId, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instructorReviewKeys.lists() });
    },
  });
}

// ---------- Revenue ----------

export function useInstructorRevenue(page = 1) {
  return useQuery({
    queryKey: instructorRevenueKeys.list(page),
    queryFn: () => fetchInstructorRevenue(page),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

// ---------- Announcements ----------

export function useInstructorAnnouncements(page = 1) {
  return useQuery({
    queryKey: instructorAnnouncementKeys.list(page),
    queryFn: () => fetchInstructorAnnouncements(page),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAnnouncementInput) => createAnnouncement(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instructorAnnouncementKeys.lists() });
    },
  });
}
