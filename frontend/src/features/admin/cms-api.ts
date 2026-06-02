import { api } from "@/lib/api-client";

import {
  achievementSchema,
  achievementsSchema,
  auditFeedSchema,
  blogCategoriesSchema,
  blogCategorySchema,
  blogPostDetailSchema,
  blogPostsSchema,
  categoriesSchema,
  categorySchema,
  faqSchema,
  faqsSchema,
  homeContentSchema,
  settingsOverviewSchema,
  testimonialSchema,
  testimonialsSchema,
  type Achievement,
  type AuditFeed,
  type BlogCategory,
  type BlogPostDetail,
  type BlogPosts,
  type BlogStatus,
  type Category,
  type Faq,
  type HomeContent,
  type SettingsOverview,
  type Testimonial,
} from "./cms-schemas";

// ---------- Blog posts ----------

export type AdminBlogParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: BlogStatus;
  categoryId?: string;
};

export async function fetchBlogPosts(params: AdminBlogParams): Promise<BlogPosts> {
  const { data } = await api.get("/admin/blog", { params });
  return blogPostsSchema.parse(data);
}

export async function fetchBlogPost(id: string): Promise<BlogPostDetail> {
  const { data } = await api.get(`/admin/blog/${id}`);
  return blogPostDetailSchema.parse(data);
}

export type BlogPostInput = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  categoryId?: string | null;
  tags?: string[];
  status?: BlogStatus;
};

export async function createBlogPost(body: BlogPostInput): Promise<BlogPostDetail> {
  const { data } = await api.post("/admin/blog", body);
  return blogPostDetailSchema.parse(data);
}

export async function updateBlogPost(
  id: string,
  body: BlogPostInput,
): Promise<BlogPostDetail> {
  const { data } = await api.patch(`/admin/blog/${id}`, body);
  return blogPostDetailSchema.parse(data);
}

export async function deleteBlogPost(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  const { data } = await api.delete(`/admin/blog/${id}`);
  return data as { id: string; deleted: boolean };
}

// ---------- Blog categories ----------

export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  const { data } = await api.get("/admin/blog/categories");
  return blogCategoriesSchema.parse(data);
}

export type BlogCategoryInput = {
  name?: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
};

export async function createBlogCategory(
  body: BlogCategoryInput,
): Promise<BlogCategory> {
  const { data } = await api.post("/admin/blog/categories", body);
  return blogCategorySchema.parse(data);
}

export async function updateBlogCategory(
  id: string,
  body: BlogCategoryInput,
): Promise<BlogCategory> {
  const { data } = await api.patch(`/admin/blog/categories/${id}`, body);
  return blogCategorySchema.parse(data);
}

export async function deleteBlogCategory(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  const { data } = await api.delete(`/admin/blog/categories/${id}`);
  return data as { id: string; deleted: boolean };
}

// ---------- Course categories (CMS) ----------

export async function fetchCmsCategories(): Promise<Category[]> {
  const { data } = await api.get("/admin/cms/categories");
  return categoriesSchema.parse(data);
}

export type CategoryInput = {
  name?: string;
  slug?: string;
  description?: string;
  iconName?: string;
  sortOrder?: number;
};

export async function createCategory(body: CategoryInput): Promise<Category> {
  const { data } = await api.post("/admin/cms/categories", body);
  return categorySchema.parse(data);
}

export async function updateCategory(
  id: string,
  body: CategoryInput,
): Promise<Category> {
  const { data } = await api.patch(`/admin/cms/categories/${id}`, body);
  return categorySchema.parse(data);
}

export async function deleteCategory(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  const { data } = await api.delete(`/admin/cms/categories/${id}`);
  return data as { id: string; deleted: boolean };
}

// ---------- Achievements ----------

export async function fetchAchievements(): Promise<Achievement[]> {
  const { data } = await api.get("/admin/cms/achievements");
  return achievementsSchema.parse(data);
}

export type AchievementInput = {
  code?: string;
  title?: string;
  description?: string;
  iconName?: string;
  criteria?: Record<string, unknown>;
};

export async function createAchievement(
  body: AchievementInput,
): Promise<Achievement> {
  const { data } = await api.post("/admin/cms/achievements", body);
  return achievementSchema.parse(data);
}

export async function updateAchievement(
  id: string,
  body: AchievementInput,
): Promise<Achievement> {
  const { data } = await api.patch(`/admin/cms/achievements/${id}`, body);
  return achievementSchema.parse(data);
}

export async function deleteAchievement(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  const { data } = await api.delete(`/admin/cms/achievements/${id}`);
  return data as { id: string; deleted: boolean };
}

// ---------- Testimonials ----------

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data } = await api.get("/admin/cms/testimonials");
  return testimonialsSchema.parse(data);
}

export type TestimonialInput = {
  studentName?: string;
  studentAvatar?: string;
  studentRole?: string;
  courseName?: string;
  rating?: number;
  text?: string;
  sortOrder?: number;
  published?: boolean;
};

export async function createTestimonial(
  body: TestimonialInput,
): Promise<Testimonial> {
  const { data } = await api.post("/admin/cms/testimonials", body);
  return testimonialSchema.parse(data);
}

export async function updateTestimonial(
  id: string,
  body: TestimonialInput,
): Promise<Testimonial> {
  const { data } = await api.patch(`/admin/cms/testimonials/${id}`, body);
  return testimonialSchema.parse(data);
}

export async function deleteTestimonial(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  const { data } = await api.delete(`/admin/cms/testimonials/${id}`);
  return data as { id: string; deleted: boolean };
}

// ---------- FAQ ----------

export async function fetchFaqs(): Promise<Faq[]> {
  const { data } = await api.get("/admin/cms/faqs");
  return faqsSchema.parse(data);
}

export type FaqInput = {
  question?: string;
  answer?: string;
  sortOrder?: number;
  published?: boolean;
};

export async function createFaq(body: FaqInput): Promise<Faq> {
  const { data } = await api.post("/admin/cms/faqs", body);
  return faqSchema.parse(data);
}

export async function updateFaq(id: string, body: FaqInput): Promise<Faq> {
  const { data } = await api.patch(`/admin/cms/faqs/${id}`, body);
  return faqSchema.parse(data);
}

export async function deleteFaq(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  const { data } = await api.delete(`/admin/cms/faqs/${id}`);
  return data as { id: string; deleted: boolean };
}

// ---------- Home content ----------

export async function fetchAdminHome(): Promise<HomeContent> {
  const { data } = await api.get("/admin/cms/home");
  return homeContentSchema.parse(data);
}

export async function updateAdminHome(
  body: Partial<HomeContent>,
): Promise<HomeContent> {
  const { data } = await api.patch("/admin/cms/home", body);
  return homeContentSchema.parse(data);
}

// ---------- Settings ----------

export async function fetchSettings(): Promise<SettingsOverview> {
  const { data } = await api.get("/admin/settings");
  return settingsOverviewSchema.parse(data);
}

export type SettingsInput = {
  commissionRate?: number;
  maintenanceMode?: boolean;
  emailSender?: { name: string; address: string };
};

export async function updateSettings(
  body: SettingsInput,
): Promise<SettingsOverview> {
  const { data } = await api.patch("/admin/settings", body);
  return settingsOverviewSchema.parse(data);
}

export type AuditFeedParams = {
  page?: number;
  limit?: number;
  action?: string;
  targetType?: string;
};

export async function fetchAuditFeed(
  params: AuditFeedParams,
): Promise<AuditFeed> {
  const { data } = await api.get("/admin/settings/audit", { params });
  return auditFeedSchema.parse(data);
}
