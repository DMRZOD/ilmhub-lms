import { api } from "@/lib/api-client";

import {
  adminApplicationDecisionSchema,
  adminApplicationsSchema,
  adminCourseDetailSchema,
  adminCourseNotesSchema,
  adminCoursesSchema,
  adminInstructorsSchema,
  adminOverviewSchema,
  adminRefundSchema,
  adminRefundsSchema,
  adminReviewReportsSchema,
  adminUserDetailSchema,
  adminUsersSchema,
  myRefundsSchema,
  revenueSchema,
  topCategoriesSchema,
  topCoursesSchema,
  usersGrowthSchema,
  type AdminApplicationDecision,
  type AdminApplications,
  type AdminCourseDetail,
  type AdminCourseNotes,
  type AdminCourses,
  type AdminInstructors,
  type AdminOverview,
  type AdminRefund,
  type AdminRefunds,
  type AdminReviewReports,
  type AdminRevenue,
  type ReviewReportStatus,
  type AdminTopCategories,
  type AdminTopCourses,
  type AdminUserDetail,
  type AdminUsers,
  type AdminUsersGrowth,
  type ApplicationStatus,
  type MyRefunds,
  type RefundStatus,
  type UserRole,
  type UserStatus,
} from "./schemas";

export type AdminCourseStatusFilter =
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED"
  | "ALL";

export type AdminRefundStatusFilter = RefundStatus | "ALL";

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const { data } = await api.get("/admin/analytics/overview");
  return adminOverviewSchema.parse(data);
}

export async function fetchAdminUsersGrowth(): Promise<AdminUsersGrowth> {
  const { data } = await api.get("/admin/analytics/users-growth");
  return usersGrowthSchema.parse(data);
}

export async function fetchAdminRevenue(): Promise<AdminRevenue> {
  const { data } = await api.get("/admin/analytics/revenue");
  return revenueSchema.parse(data);
}

export async function fetchAdminTopCourses(): Promise<AdminTopCourses> {
  const { data } = await api.get("/admin/analytics/top-courses");
  return topCoursesSchema.parse(data);
}

export async function fetchAdminTopCategories(): Promise<AdminTopCategories> {
  const { data } = await api.get("/admin/analytics/top-categories");
  return topCategoriesSchema.parse(data);
}

// ---------- Users ----------

export type AdminUsersParams = {
  page?: number;
  limit?: number;
  q?: string;
  role?: UserRole;
  status?: UserStatus;
  sort?: "newest" | "oldest" | "name" | "lastLogin";
};

export async function fetchAdminUsers(
  params: AdminUsersParams,
): Promise<AdminUsers> {
  const { data } = await api.get("/admin/users", { params });
  return adminUsersSchema.parse(data);
}

export async function fetchAdminUser(id: string): Promise<AdminUserDetail> {
  const { data } = await api.get(`/admin/users/${id}`);
  return adminUserDetailSchema.parse(data);
}

export type UpdateAdminUserBody = {
  role?: "STUDENT" | "INSTRUCTOR";
  status?: UserStatus;
};

export async function updateAdminUser(
  id: string,
  body: UpdateAdminUserBody,
): Promise<AdminUserDetail> {
  const { data } = await api.patch(`/admin/users/${id}`, body);
  return adminUserDetailSchema.parse(data);
}

export async function deleteAdminUser(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data as { id: string; deleted: boolean };
}

export type EmailAdminUsersBody = {
  userIds: string[];
  subject: string;
  body: string;
};

export async function emailAdminUsers(
  body: EmailAdminUsersBody,
): Promise<{ sent: number }> {
  const { data } = await api.post("/admin/users/email", body);
  return data as { sent: number };
}

// ---------- Instructors ----------

export type AdminInstructorsParams = {
  page?: number;
  limit?: number;
  q?: string;
  sort?: "name" | "students" | "revenue";
};

export async function fetchAdminInstructors(
  params: AdminInstructorsParams,
): Promise<AdminInstructors> {
  const { data } = await api.get("/admin/instructors", { params });
  return adminInstructorsSchema.parse(data);
}

// ---------- Instructor applications ----------

export type AdminApplicationsParams = {
  page?: number;
  limit?: number;
};

export async function fetchAdminApplications(
  status: ApplicationStatus,
  params: AdminApplicationsParams,
): Promise<AdminApplications> {
  const { data } = await api.get("/admin/instructor-applications", {
    params: { ...params, status },
  });
  return adminApplicationsSchema.parse(data);
}

export async function approveApplication(
  id: string,
): Promise<AdminApplicationDecision> {
  const { data } = await api.patch(`/admin/instructor-applications/${id}/approve`);
  return adminApplicationDecisionSchema.parse(data);
}

export async function rejectApplication(
  id: string,
  reason: string,
): Promise<AdminApplicationDecision> {
  const { data } = await api.patch(
    `/admin/instructor-applications/${id}/reject`,
    { reason },
  );
  return adminApplicationDecisionSchema.parse(data);
}

// ---------- Course moderation ----------

export type AdminCoursesParams = {
  page?: number;
  limit?: number;
  status?: AdminCourseStatusFilter;
  q?: string;
};

export async function fetchAdminCourses(
  params: AdminCoursesParams,
): Promise<AdminCourses> {
  const { data } = await api.get("/admin/courses", { params });
  return adminCoursesSchema.parse(data);
}

export async function fetchAdminCourse(id: string): Promise<AdminCourseDetail> {
  const { data } = await api.get(`/admin/courses/${id}`);
  return adminCourseDetailSchema.parse(data);
}

export async function approveCourse(id: string): Promise<AdminCourseDetail> {
  const { data } = await api.patch(`/admin/courses/${id}/approve`);
  return adminCourseDetailSchema.parse(data);
}

export async function rejectCourse(
  id: string,
  reason: string,
): Promise<AdminCourseDetail> {
  const { data } = await api.patch(`/admin/courses/${id}/reject`, { reason });
  return adminCourseDetailSchema.parse(data);
}

export async function archiveCourse(id: string): Promise<AdminCourseDetail> {
  const { data } = await api.patch(`/admin/courses/${id}/archive`);
  return adminCourseDetailSchema.parse(data);
}

export async function addCourseNote(
  id: string,
  note: string,
): Promise<AdminCourseNotes> {
  const { data } = await api.post(`/admin/courses/${id}/notes`, { note });
  return adminCourseNotesSchema.parse(data);
}

// ---------- Refunds (admin) ----------

export type AdminRefundsParams = {
  page?: number;
  limit?: number;
  status?: AdminRefundStatusFilter;
};

export async function fetchAdminRefunds(
  params: AdminRefundsParams,
): Promise<AdminRefunds> {
  const { data } = await api.get("/admin/refunds", { params });
  return adminRefundsSchema.parse(data);
}

export async function approveRefund(id: string): Promise<AdminRefund> {
  const { data } = await api.patch(`/admin/refunds/${id}/approve`);
  return adminRefundSchema.parse(data);
}

export async function rejectRefund(
  id: string,
  reason: string,
): Promise<AdminRefund> {
  const { data } = await api.patch(`/admin/refunds/${id}/reject`, { reason });
  return adminRefundSchema.parse(data);
}

// ---------- Review reports (admin) ----------

export type AdminReportStatusFilter = ReviewReportStatus | "ALL";

export type AdminReportsParams = {
  page?: number;
  limit?: number;
  status?: AdminReportStatusFilter;
};

export async function fetchAdminReports(
  params: AdminReportsParams,
): Promise<AdminReviewReports> {
  const { data } = await api.get("/admin/reports", { params });
  return adminReviewReportsSchema.parse(data);
}

export async function dismissReport(
  id: string,
): Promise<{ id: string; status: string }> {
  const { data } = await api.patch(`/admin/reports/${id}/dismiss`);
  return data as { id: string; status: string };
}

export async function removeReportedReview(
  id: string,
): Promise<{ id: string; reviewId: string; status: string }> {
  const { data } = await api.patch(`/admin/reports/${id}/remove`);
  return data as { id: string; reviewId: string; status: string };
}

// ---------- Refunds (student) ----------

export async function fetchMyRefunds(): Promise<MyRefunds> {
  const { data } = await api.get("/me/refunds");
  return myRefundsSchema.parse(data);
}

export async function requestRefund(body: {
  courseId: string;
  reason: string;
}): Promise<{ id: string; orderId: string; status: string }> {
  const { data } = await api.post("/me/refunds", body);
  return data as { id: string; orderId: string; status: string };
}
