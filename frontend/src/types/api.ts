import { z } from "zod";

export const courseLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
export type CourseLevel = z.infer<typeof courseLevelSchema>;

export const courseLanguageSchema = z.enum(["UZ", "RU", "EN"]);
export type CourseLanguage = z.infer<typeof courseLanguageSchema>;

export const courseSortSchema = z.enum([
  "popular",
  "new",
  "rating",
  "price-asc",
  "price-desc",
]);
export type CourseSort = z.infer<typeof courseSortSchema>;

export const instructorSortSchema = z.enum(["popular", "new", "rating"]);
export type InstructorSort = z.infer<typeof instructorSortSchema>;

export const paginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export function paginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    meta: paginationMetaSchema,
  });
}

const instructorRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable().optional(),
});

const categoryRefSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  iconName: z.string().nullable().optional(),
});

export const courseCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  level: courseLevelSchema,
  language: courseLanguageSchema,
  priceUsdCents: z.number().int().nonnegative(),
  discountUsdCents: z.number().int().nonnegative().nullable().optional(),
  durationMinutes: z.number().int().nonnegative(),
  lessonsCount: z.number().int().nonnegative(),
  studentsCount: z.number().int().nonnegative(),
  ratingAvg: z.number().min(0).max(5),
  ratingCount: z.number().int().nonnegative(),
  publishedAt: z.string().nullable().optional(),
  instructor: instructorRefSchema,
  category: categoryRefSchema,
});
export type CourseCard = z.infer<typeof courseCardSchema>;

export const courseListResponseSchema = paginatedSchema(courseCardSchema);
export type CourseListResponse = z.infer<typeof courseListResponseSchema>;

export const featuredCoursesResponseSchema = z.array(courseCardSchema);
export type FeaturedCoursesResponse = z.infer<typeof featuredCoursesResponseSchema>;

// ---------- Orders / checkout ----------

export const orderStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const paymentProviderSchema = z.enum(["PAYME", "CLICK", "UZUM"]);
export type PaymentProvider = z.infer<typeof paymentProviderSchema>;

export const orderItemSchema = z.object({
  courseId: z.string(),
  priceUsdCents: z.number().int().nonnegative(),
  course: courseCardSchema,
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderDetailSchema = z.object({
  id: z.string(),
  status: orderStatusSchema,
  paymentMethod: paymentProviderSchema,
  totalUsdCents: z.number().int().nonnegative(),
  paidAt: z.string().nullable(),
  createdAt: z.string(),
  firstLessonId: z.string().nullable(),
  items: z.array(orderItemSchema),
});
export type OrderDetail = z.infer<typeof orderDetailSchema>;

export const createOrderResponseSchema = z.object({
  orderId: z.string(),
  paymentUrl: z.string(),
});
export type CreateOrderResponse = z.infer<typeof createOrderResponseSchema>;

export const myOrdersResponseSchema = paginatedSchema(orderDetailSchema);
export type MyOrdersResponse = z.infer<typeof myOrdersResponseSchema>;

const lessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  order: z.number().int().nonnegative(),
  type: z.string(),
  durationSeconds: z.number().int().nonnegative(),
  isPreview: z.boolean(),
  videoAssetId: z.string().nullable().optional(),
});
export type Lesson = z.infer<typeof lessonSchema>;

const courseSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number().int().nonnegative(),
  lessonsCount: z.number().int().nonnegative(),
  durationMinutes: z.number().int().nonnegative(),
  lessons: z.array(lessonSchema),
});
export type CourseSection = z.infer<typeof courseSectionSchema>;

const reviewUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable().optional(),
});

export const courseReviewSchema = z.object({
  id: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  user: reviewUserSchema,
  replyComment: z.string().nullable().optional(),
  repliedAt: z.string().nullable().optional(),
  helpfulCount: z.number().int().nonnegative().default(0),
  viewerHasVoted: z.boolean().optional(),
  isOwn: z.boolean().optional(),
});
export type CourseReview = z.infer<typeof courseReviewSchema>;

export const courseReviewsResponseSchema = paginatedSchema(courseReviewSchema);
export type CourseReviewsResponse = z.infer<typeof courseReviewsResponseSchema>;

const detailInstructorSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});

export const courseDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  longDescription: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  previewVideoUrl: z.string().nullable().optional(),
  level: courseLevelSchema,
  language: courseLanguageSchema,
  priceUsdCents: z.number().int().nonnegative(),
  discountUsdCents: z.number().int().nonnegative().nullable().optional(),
  durationMinutes: z.number().int().nonnegative(),
  lessonsCount: z.number().int().nonnegative(),
  studentsCount: z.number().int().nonnegative(),
  ratingAvg: z.number().min(0).max(5),
  ratingCount: z.number().int().nonnegative(),
  learningOutcomes: z.array(z.string()),
  requirements: z.array(z.string()),
  publishedAt: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  instructor: detailInstructorSchema,
  category: categoryRefSchema,
  sections: z.array(courseSectionSchema),
  reviews: courseReviewsResponseSchema,
  isEnrolled: z.boolean().optional(),
  isFavorited: z.boolean().optional(),
  currentUserProgress: z
    .object({
      lastLessonId: z.string().nullable(),
      lastLessonTitle: z.string().nullable(),
      progressPercent: z.number().int().min(0).max(100),
      completedAt: z.string().nullable(),
    })
    .nullable()
    .optional(),
});
export type CourseDetail = z.infer<typeof courseDetailSchema>;

export const enrollmentStatusSchema = z.enum([
  "all",
  "inProgress",
  "completed",
  "notStarted",
]);
export type EnrollmentStatusFilter = z.infer<typeof enrollmentStatusSchema>;

export const enrollmentSortSchema = z.enum(["recent", "enrolled", "progress"]);
export type EnrollmentSort = z.infer<typeof enrollmentSortSchema>;

export const enrolledCourseSchema = z.object({
  id: z.string(),
  enrolledAt: z.string(),
  completedAt: z.string().nullable(),
  progressPercent: z.number().int().min(0).max(100),
  lastAccessedAt: z.string().nullable(),
  reviewedByMe: z.boolean().default(false),
  course: courseCardSchema,
});
export type EnrolledCourse = z.infer<typeof enrolledCourseSchema>;

export const enrolledCoursesResponseSchema =
  paginatedSchema(enrolledCourseSchema);
export type EnrolledCoursesResponse = z.infer<
  typeof enrolledCoursesResponseSchema
>;

export interface EnrollmentFiltersInput {
  page?: number;
  limit?: number;
  status?: EnrollmentStatusFilter;
  sort?: EnrollmentSort;
}

export interface FavoritesFiltersInput {
  page?: number;
  limit?: number;
}

export const categorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  iconName: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  coursesCount: z.number().int().nonnegative().optional(),
});
export type Category = z.infer<typeof categorySchema>;

export const categoriesResponseSchema = z.array(categorySchema);
export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>;

export const categoryDetailResponseSchema = z.object({
  category: categorySchema,
  courses: courseListResponseSchema,
});
export type CategoryDetailResponse = z.infer<typeof categoryDetailResponseSchema>;

const instructorStatsSchema = z.object({
  coursesCount: z.number().int().nonnegative(),
  studentsCount: z.number().int().nonnegative(),
  ratingAvg: z.number().min(0).max(5),
  reviewsCount: z.number().int().nonnegative(),
});

export const instructorCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  stats: instructorStatsSchema,
});
export type InstructorCard = z.infer<typeof instructorCardSchema>;

export const instructorListResponseSchema = paginatedSchema(instructorCardSchema);
export type InstructorListResponse = z.infer<typeof instructorListResponseSchema>;

export const instructorDetailSchema = instructorCardSchema.extend({
  courses: z.array(courseCardSchema),
});
export type InstructorDetail = z.infer<typeof instructorDetailSchema>;

export interface CourseFiltersInput {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  level?: CourseLevel[];
  language?: CourseLanguage[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minDuration?: number;
  maxDuration?: number;
  sort?: CourseSort;
}

export interface InstructorFiltersInput {
  page?: number;
  limit?: number;
  search?: string;
  sort?: InstructorSort;
}
