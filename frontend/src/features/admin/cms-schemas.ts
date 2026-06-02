import { z } from "zod";

const paginationMeta = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({ items: z.array(item), meta: paginationMeta });
}

const personSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

// ---------- Blog ----------

export const blogStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);
export type BlogStatus = z.infer<typeof blogStatusSchema>;

const blogCategoryRef = z
  .object({ id: z.string(), name: z.string(), slug: z.string() })
  .nullable();

export const blogPostListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  tags: z.array(z.string()),
  status: blogStatusSchema,
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: personSchema,
  category: blogCategoryRef,
});
export const blogPostsSchema = paginated(blogPostListItemSchema);
export type BlogPostListItem = z.infer<typeof blogPostListItemSchema>;
export type BlogPosts = z.infer<typeof blogPostsSchema>;

export const blogPostDetailSchema = blogPostListItemSchema.extend({
  content: z.string(),
});
export type BlogPostDetail = z.infer<typeof blogPostDetailSchema>;

export const blogCategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number(),
});
export const blogCategoriesSchema = z.array(blogCategorySchema);
export type BlogCategory = z.infer<typeof blogCategorySchema>;

// ---------- Course categories ----------

export const categorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  iconName: z.string().nullable(),
  sortOrder: z.number(),
  coursesCount: z.number(),
});
export const categoriesSchema = z.array(categorySchema);
export type Category = z.infer<typeof categorySchema>;

// ---------- Achievements ----------

export const achievementSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string(),
  iconName: z.string().nullable(),
  criteria: z.unknown().nullable(),
});
export const achievementsSchema = z.array(achievementSchema);
export type Achievement = z.infer<typeof achievementSchema>;

// ---------- Testimonials ----------

export const testimonialSchema = z.object({
  id: z.string(),
  studentName: z.string(),
  studentAvatar: z.string().nullable(),
  studentRole: z.string().nullable(),
  courseName: z.string().nullable(),
  rating: z.number(),
  text: z.string(),
  sortOrder: z.number(),
  published: z.boolean(),
});
export const testimonialsSchema = z.array(testimonialSchema);
export type Testimonial = z.infer<typeof testimonialSchema>;

// ---------- FAQ ----------

export const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  sortOrder: z.number(),
  published: z.boolean(),
});
export const faqsSchema = z.array(faqSchema);
export type Faq = z.infer<typeof faqSchema>;

// ---------- Home content ----------

export const homeHeroSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  primaryCtaLabel: z.string(),
  primaryCtaHref: z.string(),
  secondaryCtaLabel: z.string(),
  secondaryCtaHref: z.string(),
});
export type HomeHero = z.infer<typeof homeHeroSchema>;

export const homeStatSchema = z.object({
  value: z.number(),
  suffix: z.string(),
  label: z.string(),
});
export type HomeStat = z.infer<typeof homeStatSchema>;

export const homeContentSchema = z.object({
  hero: homeHeroSchema,
  stats: z.array(homeStatSchema),
});
export type HomeContent = z.infer<typeof homeContentSchema>;

// ---------- Settings ----------

export const settingsOverviewSchema = z.object({
  commissionRate: z.number(),
  maintenanceMode: z.boolean(),
  emailSender: z.object({ name: z.string(), address: z.string() }),
  integrations: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      configured: z.boolean(),
    }),
  ),
  emailTemplates: z.array(
    z.object({
      key: z.string(),
      name: z.string(),
      description: z.string(),
    }),
  ),
});
export type SettingsOverview = z.infer<typeof settingsOverviewSchema>;

// ---------- Audit feed ----------

export const auditFeedEntrySchema = z.object({
  id: z.string(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string().nullable(),
  metadata: z.unknown(),
  createdAt: z.string(),
  actor: personSchema.nullable(),
});
export const auditFeedSchema = paginated(auditFeedEntrySchema);
export type AuditFeedEntry = z.infer<typeof auditFeedEntrySchema>;
export type AuditFeed = z.infer<typeof auditFeedSchema>;
