import { api } from "@/lib/api-client";
import {
  courseDetailSchema,
  courseListResponseSchema,
  courseReviewSchema,
  courseReviewsResponseSchema,
  featuredCoursesResponseSchema,
  type CourseDetail,
  type CourseFiltersInput,
  type CourseListResponse,
  type CourseReview,
  type CourseReviewsResponse,
  type FeaturedCoursesResponse,
} from "@/types/api";

function toParams(filters: CourseFiltersInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (filters.page != null) out.page = filters.page;
  if (filters.limit != null) out.limit = filters.limit;
  if (filters.search) out.search = filters.search;
  if (filters.categorySlug) out.categorySlug = filters.categorySlug;
  if (filters.level && filters.level.length > 0) out.level = filters.level;
  if (filters.language && filters.language.length > 0) {
    out.language = filters.language;
  }
  if (filters.minPrice != null) out.minPrice = filters.minPrice;
  if (filters.maxPrice != null) out.maxPrice = filters.maxPrice;
  if (filters.minRating != null) out.minRating = filters.minRating;
  if (filters.minDuration != null) out.minDuration = filters.minDuration;
  if (filters.maxDuration != null) out.maxDuration = filters.maxDuration;
  if (filters.sort) out.sort = filters.sort;
  return out;
}

export async function fetchCourses(
  filters: CourseFiltersInput = {},
): Promise<CourseListResponse> {
  const { data } = await api.get("/courses", { params: toParams(filters) });
  return courseListResponseSchema.parse(data);
}

export async function fetchFeaturedCourses(
  limit?: number,
): Promise<FeaturedCoursesResponse> {
  const { data } = await api.get("/courses/featured", {
    params: limit != null ? { limit } : undefined,
  });
  return featuredCoursesResponseSchema.parse(data);
}

export async function fetchCourseBySlug(slug: string): Promise<CourseDetail> {
  const { data } = await api.get(`/courses/${encodeURIComponent(slug)}`);
  return courseDetailSchema.parse(data);
}

export type ReviewSort =
  | "helpful"
  | "newest"
  | "oldest"
  | "highest"
  | "lowest";

export interface ReviewListParams {
  page?: number;
  limit?: number;
  rating?: number;
  sort?: ReviewSort;
}

export async function fetchCourseReviews(
  slug: string,
  params: ReviewListParams = {},
): Promise<CourseReviewsResponse> {
  const query: Record<string, unknown> = { page: params.page ?? 1 };
  if (params.limit != null) query.limit = params.limit;
  if (params.rating != null) query.rating = params.rating;
  if (params.sort) query.sort = params.sort;
  const { data } = await api.get(
    `/courses/${encodeURIComponent(slug)}/reviews`,
    { params: query },
  );
  return courseReviewsResponseSchema.parse(data);
}

export async function createCourseReview(
  slug: string,
  body: { rating: number; comment?: string },
): Promise<CourseReview> {
  const { data } = await api.post(
    `/courses/${encodeURIComponent(slug)}/reviews`,
    body,
  );
  return courseReviewSchema.parse(data);
}

export async function updateReview(
  id: string,
  body: { rating: number; comment?: string },
): Promise<CourseReview> {
  const { data } = await api.patch(`/reviews/${encodeURIComponent(id)}`, body);
  return courseReviewSchema.parse(data);
}

export async function deleteReview(id: string): Promise<void> {
  await api.delete(`/reviews/${encodeURIComponent(id)}`);
}

export async function addReviewHelpful(
  id: string,
): Promise<{ id: string; helpfulCount: number; viewerHasVoted: boolean }> {
  const { data } = await api.post(`/reviews/${encodeURIComponent(id)}/helpful`);
  return data as { id: string; helpfulCount: number; viewerHasVoted: boolean };
}

export async function removeReviewHelpful(
  id: string,
): Promise<{ id: string; helpfulCount: number; viewerHasVoted: boolean }> {
  const { data } = await api.delete(
    `/reviews/${encodeURIComponent(id)}/helpful`,
  );
  return data as { id: string; helpfulCount: number; viewerHasVoted: boolean };
}

export async function reportReview(
  id: string,
  reason: string,
): Promise<void> {
  await api.post(`/reviews/${encodeURIComponent(id)}/report`, { reason });
}
