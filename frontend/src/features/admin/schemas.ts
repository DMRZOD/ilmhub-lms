import { z } from "zod";

const personSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

export const adminOverviewSchema = z.object({
  stats: z.object({
    totalUsers: z.number(),
    totalCourses: z.number(),
    publishedCourses: z.number(),
    mrrUsdCents: z.number(),
    activeStudents: z.number(),
    pendingModeration: z.object({
      courses: z.number(),
      applications: z.number(),
      total: z.number(),
    }),
  }),
  pendingCourses: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      createdAt: z.string(),
      instructor: personSchema,
    }),
  ),
  pendingApplications: z.array(
    z.object({
      id: z.string(),
      expertise: z.string(),
      createdAt: z.string(),
      applicant: personSchema,
    }),
  ),
});

export const usersGrowthSchema = z.array(
  z.object({
    date: z.string(),
    count: z.number(),
  }),
);

export const revenueSchema = z.array(
  z.object({
    month: z.string(),
    revenueUsdCents: z.number(),
  }),
);

export const topCoursesSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    studentsCount: z.number(),
    ratingAvg: z.number(),
    instructor: personSchema,
    category: z.string().nullable(),
  }),
);

export const topCategoriesSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    enrollments: z.number(),
  }),
);

export type AdminOverview = z.infer<typeof adminOverviewSchema>;
export type AdminUsersGrowth = z.infer<typeof usersGrowthSchema>;
export type AdminRevenue = z.infer<typeof revenueSchema>;
export type AdminTopCourses = z.infer<typeof topCoursesSchema>;
export type AdminTopCategories = z.infer<typeof topCategoriesSchema>;

// ---------- Shared ----------

const paginationMeta = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({ items: z.array(item), meta: paginationMeta });
}

export const userRoleSchema = z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userStatusSchema = z.enum(["ACTIVE", "SUSPENDED"]);
export type UserStatus = z.infer<typeof userStatusSchema>;

const courseRef = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
});

// ---------- Users ----------

export const adminUserListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  role: userRoleSchema,
  status: userStatusSchema,
  coursesCount: z.number(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
});
export const adminUsersSchema = paginated(adminUserListItemSchema);
export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>;
export type AdminUsers = z.infer<typeof adminUsersSchema>;

export const adminAuditEntrySchema = z.object({
  id: z.string(),
  action: z.string(),
  metadata: z.unknown(),
  createdAt: z.string(),
  actor: z
    .object({
      id: z.string(),
      name: z.string(),
      avatarUrl: z.string().nullable(),
    })
    .nullable(),
});
export type AdminAuditEntry = z.infer<typeof adminAuditEntrySchema>;

export const adminUserDetailSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatarUrl: z.string().nullable(),
    bio: z.string().nullable(),
    role: userRoleSchema,
    status: userStatusSchema,
    emailVerified: z.boolean(),
    lastLoginAt: z.string().nullable(),
    createdAt: z.string(),
  }),
  courses: z.array(
    z.object({
      course: courseRef.extend({ thumbnailUrl: z.string().nullable() }),
      enrolledAt: z.string(),
      completedAt: z.string().nullable(),
    }),
  ),
  orders: z.array(
    z.object({
      id: z.string(),
      totalUsdCents: z.number(),
      status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
      paidAt: z.string().nullable(),
      createdAt: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          priceUsdCents: z.number(),
          course: courseRef,
        }),
      ),
    }),
  ),
  auditLog: z.array(adminAuditEntrySchema),
});
export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;

// ---------- Instructors ----------

export const adminInstructorListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  status: userStatusSchema,
  createdAt: z.string(),
  coursesCount: z.number(),
  totalStudents: z.number(),
  grossUsdCents: z.number(),
  netUsdCents: z.number(),
});
export const adminInstructorsSchema = paginated(adminInstructorListItemSchema);
export type AdminInstructorListItem = z.infer<
  typeof adminInstructorListItemSchema
>;
export type AdminInstructors = z.infer<typeof adminInstructorsSchema>;

// ---------- Instructor applications ----------

export const applicationStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export const adminApplicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: applicationStatusSchema,
  bio: z.string(),
  expertise: z.string(),
  sampleWorkUrls: z.array(z.string()),
  rejectedReason: z.string().nullable(),
  decidedAt: z.string().nullable(),
  createdAt: z.string(),
  applicant: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatarUrl: z.string().nullable(),
  }),
});
export const adminApplicationsSchema = paginated(adminApplicationSchema);
export type AdminApplication = z.infer<typeof adminApplicationSchema>;
export type AdminApplications = z.infer<typeof adminApplicationsSchema>;

// Approve/reject endpoints return the application without the joined applicant.
export const adminApplicationDecisionSchema = adminApplicationSchema.omit({
  applicant: true,
});
export type AdminApplicationDecision = z.infer<
  typeof adminApplicationDecisionSchema
>;

// ---------- Course moderation ----------

export const courseStatusSchema = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED",
]);
export type CourseStatus = z.infer<typeof courseStatusSchema>;

export const adminCourseListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  thumbnailUrl: z.string().nullable(),
  status: courseStatusSchema,
  priceUsdCents: z.number(),
  discountUsdCents: z.number().nullable(),
  studentsCount: z.number(),
  lessonsCount: z.number(),
  durationMinutes: z.number(),
  instructor: personSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
});
export const adminCoursesSchema = paginated(adminCourseListItemSchema);
export type AdminCourseListItem = z.infer<typeof adminCourseListItemSchema>;
export type AdminCourses = z.infer<typeof adminCoursesSchema>;

const adminCourseLessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["VIDEO", "ARTICLE", "QUIZ", "CODING"]),
  order: z.number(),
  durationSeconds: z.number(),
  isPreview: z.boolean(),
});

const adminCourseSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  lessonsCount: z.number(),
  durationMinutes: z.number(),
  lessons: z.array(adminCourseLessonSchema),
});

export const adminCourseDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  description: z.string(),
  longDescription: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  previewVideoUrl: z.string().nullable(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  language: z.enum(["UZ", "RU", "EN"]),
  priceUsdCents: z.number(),
  discountUsdCents: z.number().nullable(),
  durationMinutes: z.number(),
  lessonsCount: z.number(),
  studentsCount: z.number(),
  ratingAvg: z.number(),
  ratingCount: z.number(),
  status: courseStatusSchema,
  rejectionReason: z.string().nullable(),
  learningOutcomes: z.array(z.string()),
  requirements: z.array(z.string()),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  instructor: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  category: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  sections: z.array(adminCourseSectionSchema),
  moderationLog: z.array(adminAuditEntrySchema),
});
export type AdminCourseDetail = z.infer<typeof adminCourseDetailSchema>;

export const adminCourseNotesSchema = z.object({
  moderationLog: z.array(adminAuditEntrySchema),
});
export type AdminCourseNotes = z.infer<typeof adminCourseNotesSchema>;

// ---------- Refunds ----------

export const refundStatusSchema = z.enum([
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
]);
export type RefundStatus = z.infer<typeof refundStatusSchema>;

export const paymentProviderSchema = z.enum(["PAYME", "CLICK", "UZUM"]);
export type PaymentProvider = z.infer<typeof paymentProviderSchema>;

export const adminRefundSchema = z.object({
  id: z.string(),
  status: refundStatusSchema,
  reason: z.string(),
  decisionNote: z.string().nullable(),
  externalRefundId: z.string().nullable(),
  createdAt: z.string(),
  decidedAt: z.string().nullable(),
  student: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  order: z.object({
    id: z.string(),
    totalUsdCents: z.number(),
    paymentMethod: paymentProviderSchema,
    status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
    paidAt: z.string().nullable(),
    createdAt: z.string(),
  }),
  courses: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      thumbnailUrl: z.string().nullable(),
      priceUsdCents: z.number(),
    }),
  ),
});
export const adminRefundsSchema = paginated(adminRefundSchema);
export type AdminRefund = z.infer<typeof adminRefundSchema>;
export type AdminRefunds = z.infer<typeof adminRefundsSchema>;

// Student-side "my refunds" list (used to flag courses with open requests).
export const myRefundSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  status: refundStatusSchema,
  reason: z.string(),
  decisionNote: z.string().nullable(),
  createdAt: z.string(),
  decidedAt: z.string().nullable(),
  totalUsdCents: z.number(),
  courses: z.array(z.object({ id: z.string(), title: z.string() })),
});
export const myRefundsSchema = z.array(myRefundSchema);
export type MyRefund = z.infer<typeof myRefundSchema>;
export type MyRefunds = z.infer<typeof myRefundsSchema>;

// ---------- Review reports (Step 37) ----------

export const reviewReportStatusSchema = z.enum([
  "PENDING",
  "RESOLVED",
  "DISMISSED",
]);
export type ReviewReportStatus = z.infer<typeof reviewReportStatusSchema>;

const reportUserRef = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

export const adminReviewReportSchema = z.object({
  id: z.string(),
  reason: z.string(),
  status: reviewReportStatusSchema,
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
  reporter: reportUserRef,
  review: z.object({
    id: z.string(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().nullable(),
    helpfulCount: z.number().int().nonnegative(),
    createdAt: z.string(),
    author: reportUserRef,
    course: z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
    }),
  }),
});
export const adminReviewReportsSchema = paginated(adminReviewReportSchema);
export type AdminReviewReport = z.infer<typeof adminReviewReportSchema>;
export type AdminReviewReports = z.infer<typeof adminReviewReportsSchema>;
