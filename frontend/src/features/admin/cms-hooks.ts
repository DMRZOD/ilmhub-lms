"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adminBlogKeys,
  adminCmsKeys,
  adminSettingsKeys,
  contentKeys,
} from "@/lib/query-keys";

import {
  createAchievement,
  createBlogCategory,
  createBlogPost,
  createCategory,
  createFaq,
  createTestimonial,
  deleteAchievement,
  deleteBlogCategory,
  deleteBlogPost,
  deleteCategory,
  deleteFaq,
  deleteTestimonial,
  fetchAchievements,
  fetchAdminHome,
  fetchAuditFeed,
  fetchBlogCategories,
  fetchBlogPost,
  fetchBlogPosts,
  fetchCmsCategories,
  fetchFaqs,
  fetchSettings,
  fetchTestimonials,
  updateAchievement,
  updateAdminHome,
  updateBlogCategory,
  updateBlogPost,
  updateCategory,
  updateFaq,
  updateSettings,
  updateTestimonial,
  type AchievementInput,
  type AdminBlogParams,
  type AuditFeedParams,
  type BlogCategoryInput,
  type BlogPostInput,
  type CategoryInput,
  type FaqInput,
  type SettingsInput,
  type TestimonialInput,
} from "./cms-api";
import type { HomeContent } from "./cms-schemas";

const FAIL = "Amalni bajarib bo'lmadi";

// ---------- Blog ----------

export function useBlogPosts(params: AdminBlogParams) {
  return useQuery({
    queryKey: adminBlogKeys.list(params),
    queryFn: () => fetchBlogPosts(params),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });
}

export function useBlogPost(id: string | undefined) {
  return useQuery({
    queryKey: adminBlogKeys.detail(id ?? ""),
    queryFn: () => fetchBlogPost(id as string),
    enabled: Boolean(id),
    staleTime: 10_000,
  });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BlogPostInput) => createBlogPost(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminBlogKeys.lists() });
    },
    onError: () => toast.error(FAIL),
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: BlogPostInput }) =>
      updateBlogPost(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: adminBlogKeys.lists() });
      qc.invalidateQueries({ queryKey: adminBlogKeys.detail(id) });
    },
    onError: () => toast.error(FAIL),
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBlogPost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminBlogKeys.lists() });
      toast.success("Post o'chirildi");
    },
    onError: () => toast.error(FAIL),
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: adminBlogKeys.categories(),
    queryFn: fetchBlogCategories,
    staleTime: 60_000,
  });
}

export function useCreateBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BlogCategoryInput) => createBlogCategory(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminBlogKeys.categories() });
      toast.success("Saqlandi");
    },
    onError: () => toast.error(FAIL),
  });
}

export function useUpdateBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: BlogCategoryInput }) =>
      updateBlogCategory(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminBlogKeys.categories() });
      toast.success("Saqlandi");
    },
    onError: () => toast.error(FAIL),
  });
}

export function useDeleteBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBlogCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminBlogKeys.categories() });
      toast.success("O'chirildi");
    },
    onError: () => toast.error(FAIL),
  });
}

// ---------- Course categories ----------

export function useCmsCategories() {
  return useQuery({
    queryKey: adminCmsKeys.categories(),
    queryFn: fetchCmsCategories,
    staleTime: 30_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CategoryInput) => createCategory(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.categories() });
      toast.success("Saqlandi");
    },
    onError: () => toast.error(FAIL),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CategoryInput }) =>
      updateCategory(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.categories() });
      toast.success("Saqlandi");
    },
    onError: () => toast.error(FAIL),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.categories() });
      toast.success("O'chirildi");
    },
    onError: (err) => {
      const code = errorCode(err);
      if (code === "category_has_courses") {
        toast.error("Bu kategoriyada kurslar bor — avval ularni ko'chiring");
      } else {
        toast.error(FAIL);
      }
    },
  });
}

// ---------- Achievements ----------

export function useAchievements() {
  return useQuery({
    queryKey: adminCmsKeys.achievements(),
    queryFn: fetchAchievements,
    staleTime: 30_000,
  });
}

export function useCreateAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AchievementInput) => createAchievement(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.achievements() });
      toast.success("Saqlandi");
    },
    onError: (err) => {
      if (errorCode(err) === "achievement_code_taken") {
        toast.error("Bu kod allaqachon ishlatilgan");
      } else {
        toast.error(FAIL);
      }
    },
  });
}

export function useUpdateAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AchievementInput }) =>
      updateAchievement(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.achievements() });
      toast.success("Saqlandi");
    },
    onError: (err) => {
      if (errorCode(err) === "achievement_code_taken") {
        toast.error("Bu kod allaqachon ishlatilgan");
      } else {
        toast.error(FAIL);
      }
    },
  });
}

export function useDeleteAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAchievement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.achievements() });
      toast.success("O'chirildi");
    },
    onError: () => toast.error(FAIL),
  });
}

// ---------- Testimonials ----------

export function useTestimonials() {
  return useQuery({
    queryKey: adminCmsKeys.testimonials(),
    queryFn: fetchTestimonials,
    staleTime: 30_000,
  });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TestimonialInput) => createTestimonial(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.testimonials() });
      qc.invalidateQueries({ queryKey: contentKeys.home() });
      toast.success("Saqlandi");
    },
    onError: () => toast.error(FAIL),
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TestimonialInput }) =>
      updateTestimonial(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.testimonials() });
      qc.invalidateQueries({ queryKey: contentKeys.home() });
      toast.success("Saqlandi");
    },
    onError: () => toast.error(FAIL),
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.testimonials() });
      qc.invalidateQueries({ queryKey: contentKeys.home() });
      toast.success("O'chirildi");
    },
    onError: () => toast.error(FAIL),
  });
}

// ---------- FAQ ----------

export function useFaqs() {
  return useQuery({
    queryKey: adminCmsKeys.faqs(),
    queryFn: fetchFaqs,
    staleTime: 30_000,
  });
}

export function useCreateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FaqInput) => createFaq(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.faqs() });
      qc.invalidateQueries({ queryKey: contentKeys.home() });
      toast.success("Saqlandi");
    },
    onError: () => toast.error(FAIL),
  });
}

export function useUpdateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: FaqInput }) =>
      updateFaq(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.faqs() });
      qc.invalidateQueries({ queryKey: contentKeys.home() });
      toast.success("Saqlandi");
    },
    onError: () => toast.error(FAIL),
  });
}

export function useDeleteFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFaq(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.faqs() });
      qc.invalidateQueries({ queryKey: contentKeys.home() });
      toast.success("O'chirildi");
    },
    onError: () => toast.error(FAIL),
  });
}

// ---------- Home content ----------

export function useAdminHome() {
  return useQuery({
    queryKey: adminCmsKeys.home(),
    queryFn: fetchAdminHome,
    staleTime: 30_000,
  });
}

export function useUpdateAdminHome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<HomeContent>) => updateAdminHome(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCmsKeys.home() });
      qc.invalidateQueries({ queryKey: contentKeys.home() });
      toast.success("Bosh sahifa yangilandi");
    },
    onError: () => toast.error(FAIL),
  });
}

// ---------- Settings ----------

export function useSettings() {
  return useQuery({
    queryKey: adminSettingsKeys.overview(),
    queryFn: fetchSettings,
    staleTime: 30_000,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SettingsInput) => updateSettings(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminSettingsKeys.overview() });
      toast.success("Sozlamalar saqlandi");
    },
    onError: () => toast.error(FAIL),
  });
}

export function useAuditFeed(params: AuditFeedParams) {
  return useQuery({
    queryKey: adminSettingsKeys.audit(params),
    queryFn: () => fetchAuditFeed(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
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
