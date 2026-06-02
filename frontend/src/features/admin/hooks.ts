"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adminAnalyticsKeys,
  adminCoursesKeys,
  adminInstructorsKeys,
  adminRefundsKeys,
  adminReportsKeys,
  adminUsersKeys,
  myRefundsKeys,
  studentKeys,
} from "@/lib/query-keys";

import {
  addCourseNote,
  approveApplication,
  approveCourse,
  approveRefund,
  archiveCourse,
  deleteAdminUser,
  dismissReport,
  emailAdminUsers,
  fetchAdminApplications,
  fetchAdminCourse,
  fetchAdminCourses,
  fetchAdminInstructors,
  fetchAdminOverview,
  fetchAdminRefunds,
  fetchAdminReports,
  fetchAdminRevenue,
  fetchAdminTopCategories,
  fetchAdminTopCourses,
  fetchAdminUser,
  fetchAdminUsers,
  fetchAdminUsersGrowth,
  fetchMyRefunds,
  rejectApplication,
  rejectCourse,
  rejectRefund,
  removeReportedReview,
  requestRefund,
  updateAdminUser,
  type AdminApplicationsParams,
  type AdminCoursesParams,
  type AdminInstructorsParams,
  type AdminRefundsParams,
  type AdminReportsParams,
  type AdminUsersParams,
  type EmailAdminUsersBody,
  type UpdateAdminUserBody,
} from "./api";
import type { ApplicationStatus } from "./schemas";

export function useAdminOverview() {
  return useQuery({
    queryKey: adminAnalyticsKeys.overview(),
    queryFn: fetchAdminOverview,
    staleTime: 60_000,
  });
}

export function useAdminUsersGrowth() {
  return useQuery({
    queryKey: adminAnalyticsKeys.usersGrowth(),
    queryFn: fetchAdminUsersGrowth,
    staleTime: 60_000,
  });
}

export function useAdminRevenue() {
  return useQuery({
    queryKey: adminAnalyticsKeys.revenue(),
    queryFn: fetchAdminRevenue,
    staleTime: 60_000,
  });
}

export function useAdminTopCourses() {
  return useQuery({
    queryKey: adminAnalyticsKeys.topCourses(),
    queryFn: fetchAdminTopCourses,
    staleTime: 60_000,
  });
}

export function useAdminTopCategories() {
  return useQuery({
    queryKey: adminAnalyticsKeys.topCategories(),
    queryFn: fetchAdminTopCategories,
    staleTime: 60_000,
  });
}

// ---------- Users ----------

export function useAdminUsers(params: AdminUsersParams) {
  return useQuery({
    queryKey: adminUsersKeys.list(params),
    queryFn: () => fetchAdminUsers(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: adminUsersKeys.detail(id ?? ""),
    queryFn: () => fetchAdminUser(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useUpdateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAdminUserBody }) =>
      updateAdminUser(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      qc.invalidateQueries({ queryKey: adminUsersKeys.detail(id) });
      qc.invalidateQueries({ queryKey: adminInstructorsKeys.lists() });
      toast.success("O'zgartirildi");
    },
    onError: () => toast.error("Amalni bajarib bo'lmadi"),
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      toast.success("Foydalanuvchi o'chirildi");
    },
    onError: (err) => {
      const code = errorCode(err);
      if (code === "user_owns_courses") {
        toast.error("Bu foydalanuvchi kurslarga ega — avval kurslarni o'chiring");
      } else if (code === "cannot_delete_last_admin") {
        toast.error("Oxirgi adminni o'chirib bo'lmaydi");
      } else {
        toast.error("O'chirib bo'lmadi");
      }
    },
  });
}

export function useEmailAdminUsers() {
  return useMutation({
    mutationFn: (body: EmailAdminUsersBody) => emailAdminUsers(body),
    onSuccess: (res) => {
      toast.success(`${res.sent} ta foydalanuvchiga yuborildi`);
    },
    onError: () => toast.error("Xabarni yuborib bo'lmadi"),
  });
}

// ---------- Instructors ----------

export function useAdminInstructors(params: AdminInstructorsParams) {
  return useQuery({
    queryKey: adminInstructorsKeys.list(params),
    queryFn: () => fetchAdminInstructors(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

// ---------- Instructor applications ----------

export function useAdminApplications(
  status: ApplicationStatus,
  params: AdminApplicationsParams,
) {
  return useQuery({
    queryKey: adminInstructorsKeys.applications({ status, ...params }),
    queryFn: () => fetchAdminApplications(status, params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useApproveApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveApplication(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminInstructorsKeys.all });
      qc.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      toast.success("Ariza tasdiqlandi");
    },
    onError: () => toast.error("Tasdiqlab bo'lmadi"),
  });
}

export function useRejectApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectApplication(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminInstructorsKeys.applicationsRoot() });
      toast.success("Ariza rad etildi");
    },
    onError: () => toast.error("Rad etib bo'lmadi"),
  });
}

// ---------- Course moderation ----------

export function useAdminCourses(params: AdminCoursesParams) {
  return useQuery({
    queryKey: adminCoursesKeys.list(params),
    queryFn: () => fetchAdminCourses(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAdminCourse(id: string | undefined) {
  return useQuery({
    queryKey: adminCoursesKeys.detail(id ?? ""),
    queryFn: () => fetchAdminCourse(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

type CourseDecision = "approve" | "reject" | "archive";

export function useModerateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: CourseDecision;
      reason?: string;
    }) => {
      if (action === "approve") return approveCourse(id);
      if (action === "archive") return archiveCourse(id);
      return rejectCourse(id, reason ?? "");
    },
    onSuccess: (_data, { id, action }) => {
      qc.invalidateQueries({ queryKey: adminCoursesKeys.lists() });
      qc.invalidateQueries({ queryKey: adminCoursesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: adminAnalyticsKeys.overview() });
      const msg =
        action === "approve"
          ? "Kurs tasdiqlandi"
          : action === "archive"
            ? "Kurs arxivlandi"
            : "Kurs rad etildi";
      toast.success(msg);
    },
    onError: () => toast.error("Amalni bajarib bo'lmadi"),
  });
}

export function useAddCourseNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      addCourseNote(id, note),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: adminCoursesKeys.detail(id) });
      toast.success("Izoh qo'shildi");
    },
    onError: () => toast.error("Izohni qo'shib bo'lmadi"),
  });
}

// ---------- Refunds (admin) ----------

export function useAdminRefunds(params: AdminRefundsParams) {
  return useQuery({
    queryKey: adminRefundsKeys.list(params),
    queryFn: () => fetchAdminRefunds(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useModerateRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: "approve" | "reject";
      reason?: string;
    }) => (action === "approve" ? approveRefund(id) : rejectRefund(id, reason ?? "")),
    onSuccess: (_data, { action }) => {
      qc.invalidateQueries({ queryKey: adminRefundsKeys.lists() });
      qc.invalidateQueries({ queryKey: adminAnalyticsKeys.overview() });
      toast.success(
        action === "approve" ? "Pul qaytarildi" : "So'rov rad etildi",
      );
    },
    onError: () => toast.error("Amalni bajarib bo'lmadi"),
  });
}

// ---------- Review reports (admin) ----------

export function useAdminReports(params: AdminReportsParams) {
  return useQuery({
    queryKey: adminReportsKeys.list(params),
    queryFn: () => fetchAdminReports(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useModerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "dismiss" | "remove" }) =>
      action === "dismiss" ? dismissReport(id) : removeReportedReview(id),
    onSuccess: (_data, { action }) => {
      qc.invalidateQueries({ queryKey: adminReportsKeys.lists() });
      toast.success(
        action === "dismiss" ? "Shikoyat rad etildi" : "Sharh olib tashlandi",
      );
    },
    onError: () => toast.error("Amalni bajarib bo'lmadi"),
  });
}

// ---------- Refunds (student) ----------

export function useMyRefunds() {
  return useQuery({
    queryKey: myRefundsKeys.list(),
    queryFn: fetchMyRefunds,
    staleTime: 30_000,
  });
}

export function useRequestRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { courseId: string; reason: string }) =>
      requestRefund(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: myRefundsKeys.all });
      qc.invalidateQueries({ queryKey: studentKeys.enrollmentsRoot() });
      toast.success("Pul qaytarish so'rovi yuborildi");
    },
    onError: (err) => {
      const code = errorCode(err);
      if (code === "refund_already_requested") {
        toast.error("Bu buyurtma uchun so'rov allaqachon yuborilgan");
      } else if (code === "refund_window_expired") {
        toast.error("Pul qaytarish muddati o'tib ketgan (7 kun)");
      } else if (code === "paid_order_not_found") {
        toast.error("To'langan buyurtma topilmadi");
      } else {
        toast.error("So'rovni yuborib bo'lmadi");
      }
    },
  });
}

function errorCode(err: unknown): string | undefined {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: unknown }).response === "object"
  ) {
    const response = (err as { response?: { data?: { message?: unknown } } })
      .response;
    const message = response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string") {
      return message[0];
    }
  }
  return undefined;
}
