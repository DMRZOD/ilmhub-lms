"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { coursesKeys, studentKeys } from "@/lib/query-keys";
import type {
  CourseFiltersInput,
  CourseReview,
  CourseReviewsResponse,
} from "@/types/api";

import {
  addReviewHelpful,
  createCourseReview,
  deleteReview,
  fetchCourseBySlug,
  fetchCourseReviews,
  fetchCourses,
  fetchFeaturedCourses,
  removeReviewHelpful,
  reportReview,
  updateReview,
  type ReviewListParams,
} from "./api";

function isNotFound(err: unknown): boolean {
  return err instanceof AxiosError && err.response?.status === 404;
}

function errorCode(err: unknown): string | undefined {
  if (err instanceof AxiosError) {
    const message = err.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string") {
      return message[0];
    }
  }
  return undefined;
}

export function useCourses(filters: CourseFiltersInput = {}) {
  return useQuery({
    queryKey: coursesKeys.list(filters),
    queryFn: () => fetchCourses(filters),
  });
}

export function useFeaturedCourses(limit?: number) {
  return useQuery({
    queryKey: coursesKeys.featured(limit),
    queryFn: () => fetchFeaturedCourses(limit),
    staleTime: 5 * 60_000,
  });
}

export function useCourse(slug: string | null | undefined) {
  return useQuery({
    queryKey: coursesKeys.detail(slug ?? ""),
    queryFn: () => fetchCourseBySlug(slug as string),
    enabled: Boolean(slug),
    retry: (count, err) => !isNotFound(err) && count < 1,
  });
}

export function useCourseReviews(
  slug: string | null | undefined,
  params: ReviewListParams = {},
) {
  return useQuery({
    queryKey: coursesKeys.reviews(slug ?? "", params as Record<string, unknown>),
    queryFn: () => fetchCourseReviews(slug as string, params),
    enabled: Boolean(slug),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

/** Invalidate the reviews list + course header + enrollments (rate chip). */
function invalidateAfterReviewChange(
  qc: ReturnType<typeof useQueryClient>,
  slug: string,
) {
  qc.invalidateQueries({ queryKey: coursesKeys.reviewsRoot(slug) });
  qc.invalidateQueries({ queryKey: coursesKeys.detail(slug) });
  qc.invalidateQueries({ queryKey: studentKeys.enrollmentsRoot() });
}

export function useCreateReview(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { rating: number; comment?: string }) =>
      createCourseReview(slug, body),
    onSuccess: () => {
      invalidateAfterReviewChange(qc, slug);
      toast.success("Sharhingiz qo'shildi");
    },
    onError: (err) => {
      const code = errorCode(err);
      if (code === "already_reviewed") {
        toast.error("Siz bu kursni allaqachon baholagansiz");
      } else if (code === "not_enrolled") {
        toast.error("Sharh qoldirish uchun kursga yozilishingiz kerak");
      } else if (code === "email_not_verified") {
        toast.error("Avval email manzilingizni tasdiqlang");
      } else {
        toast.error("Sharhni qo'shib bo'lmadi");
      }
    },
  });
}

export function useUpdateReview(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; rating: number; comment?: string }) =>
      updateReview(vars.id, { rating: vars.rating, comment: vars.comment }),
    onSuccess: () => {
      invalidateAfterReviewChange(qc, slug);
      toast.success("Sharh yangilandi");
    },
    onError: (err) => {
      const code = errorCode(err);
      if (code === "edit_window_expired") {
        toast.error("Tahrirlash muddati o'tib ketgan (30 kun)");
      } else if (code === "not_your_review") {
        toast.error("Bu sharh sizga tegishli emas");
      } else {
        toast.error("Sharhni yangilab bo'lmadi");
      }
    },
  });
}

export function useDeleteReview(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      invalidateAfterReviewChange(qc, slug);
      toast.success("Sharh o'chirildi");
    },
    onError: (err) => {
      const code = errorCode(err);
      if (code === "edit_window_expired") {
        toast.error("O'chirish muddati o'tib ketgan (30 kun)");
      } else {
        toast.error("Sharhni o'chirib bo'lmadi");
      }
    },
  });
}

export function useToggleReviewHelpful(slug: string, params: ReviewListParams) {
  const qc = useQueryClient();
  const queryKey = coursesKeys.reviews(slug, params as Record<string, unknown>);
  return useMutation({
    mutationFn: (vars: { id: string; hasVoted: boolean }) =>
      vars.hasVoted ? removeReviewHelpful(vars.id) : addReviewHelpful(vars.id),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<CourseReviewsResponse>(queryKey);
      qc.setQueryData<CourseReviewsResponse>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((r: CourseReview) =>
            r.id === vars.id
              ? {
                  ...r,
                  viewerHasVoted: !vars.hasVoted,
                  helpfulCount: Math.max(
                    0,
                    r.helpfulCount + (vars.hasVoted ? -1 : 1),
                  ),
                }
              : r,
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKey, ctx.previous);
      toast.error("Ovoz berib bo'lmadi");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey });
    },
  });
}

export function useReportReview() {
  return useMutation({
    mutationFn: (vars: { id: string; reason: string }) =>
      reportReview(vars.id, vars.reason),
    onSuccess: () => {
      toast.success("Shikoyatingiz yuborildi");
    },
    onError: (err) => {
      const code = errorCode(err);
      if (code === "already_reported") {
        toast.error("Siz bu sharh haqida allaqachon shikoyat qilgansiz");
      } else if (code === "cannot_report_own") {
        toast.error("O'z sharhingiz haqida shikoyat qilib bo'lmaydi");
      } else {
        toast.error("Shikoyatni yuborib bo'lmadi");
      }
    },
  });
}
