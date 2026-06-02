import { api } from "@/lib/api-client";

import {
  instructorAnnouncementSchema,
  instructorAnnouncementsSchema,
  instructorDashboardSchema,
  instructorRevenueSchema,
  instructorReviewSchema,
  instructorReviewsSchema,
  instructorStudentDetailSchema,
  instructorStudentsSchema,
  type AnnouncementAudience,
  type InstructorAnnouncement,
  type InstructorAnnouncements,
  type InstructorDashboard,
  type InstructorRevenue,
  type InstructorReview,
  type InstructorReviews,
  type InstructorStudentDetail,
  type InstructorStudents,
} from "./schemas";

export async function fetchInstructorDashboard(): Promise<InstructorDashboard> {
  const { data } = await api.get("/instructor/dashboard");
  return instructorDashboardSchema.parse(data);
}

// ---------- Students ----------

export type StudentsParams = {
  page?: number;
  limit?: number;
  courseId?: string;
  q?: string;
};

export async function fetchInstructorStudents(
  params: StudentsParams,
): Promise<InstructorStudents> {
  const { data } = await api.get("/instructor/students", { params });
  return instructorStudentsSchema.parse(data);
}

export async function fetchInstructorStudentDetail(
  studentId: string,
): Promise<InstructorStudentDetail> {
  const { data } = await api.get(`/instructor/students/${studentId}`);
  return instructorStudentDetailSchema.parse(data);
}

// ---------- Reviews ----------

export type ReviewsParams = {
  page?: number;
  limit?: number;
  courseId?: string;
  replied?: boolean;
  rating?: number;
  sort?: "newest" | "oldest" | "highest" | "lowest";
};

export async function fetchInstructorReviews(
  params: ReviewsParams,
): Promise<InstructorReviews> {
  const { data } = await api.get("/instructor/reviews", { params });
  return instructorReviewsSchema.parse(data);
}

export async function replyToReview(
  reviewId: string,
  comment: string,
): Promise<InstructorReview> {
  const { data } = await api.patch(`/instructor/reviews/${reviewId}/reply`, {
    comment,
  });
  return instructorReviewSchema.parse(data);
}

// ---------- Revenue ----------

export async function fetchInstructorRevenue(
  page = 1,
): Promise<InstructorRevenue> {
  const { data } = await api.get("/instructor/revenue", { params: { page } });
  return instructorRevenueSchema.parse(data);
}

// ---------- Announcements ----------

export type CreateAnnouncementInput = {
  courseId: string;
  audience: AnnouncementAudience;
  userIds?: string[];
  subject: string;
  body: string;
};

export async function createAnnouncement(
  input: CreateAnnouncementInput,
): Promise<InstructorAnnouncement> {
  const { data } = await api.post("/instructor/announcements", input);
  return instructorAnnouncementSchema.parse(data);
}

export async function fetchInstructorAnnouncements(
  page = 1,
): Promise<InstructorAnnouncements> {
  const { data } = await api.get("/instructor/announcements", {
    params: { page },
  });
  return instructorAnnouncementsSchema.parse(data);
}
