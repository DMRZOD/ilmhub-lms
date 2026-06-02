import { z } from "zod";

const courseRef = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
});

const userRef = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

export const instructorDashboardSchema = z.object({
  stats: z.object({
    totalStudents: z.number(),
    revenueAllTimeUsdCents: z.number(),
    revenueThisMonthUsdCents: z.number(),
    ratingAvg: z.number(),
    salesThisWeek: z.number(),
    coursesCount: z.number(),
    publishedCoursesCount: z.number(),
  }),
  salesChart: z.array(
    z.object({ date: z.string(), revenueUsdCents: z.number() }),
  ),
  recentEnrollments: z.array(
    z.object({
      id: z.string(),
      enrolledAt: z.string(),
      user: userRef,
      course: courseRef,
    }),
  ),
  recentReviews: z.array(
    z.object({
      id: z.string(),
      rating: z.number(),
      comment: z.string(),
      createdAt: z.string(),
      user: userRef,
      course: courseRef,
    }),
  ),
  pendingQa: z.object({
    count: z.number(),
    items: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        createdAt: z.string(),
        lastActivityAt: z.string(),
        course: courseRef,
      }),
    ),
  }),
});

export type InstructorDashboard = z.infer<typeof instructorDashboardSchema>;

// ---------- Pagination ----------

const paginationMeta = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({ items: z.array(item), meta: paginationMeta });
}

// ---------- Students ----------

export const instructorStudentSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  coursesCount: z.number(),
  totalSpentUsdCents: z.number(),
  lastActivityAt: z.string().nullable(),
});

export const instructorStudentsSchema = paginated(instructorStudentSchema);
export type InstructorStudent = z.infer<typeof instructorStudentSchema>;
export type InstructorStudents = z.infer<typeof instructorStudentsSchema>;

export const instructorStudentDetailSchema = z.object({
  student: userRef.extend({ email: z.string() }),
  courses: z.array(
    z.object({
      course: z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        thumbnailUrl: z.string().nullable(),
      }),
      enrolledAt: z.string(),
      completedAt: z.string().nullable(),
      progressPercent: z.number(),
      lastActivityAt: z.string().nullable(),
    }),
  ),
  lastActivityAt: z.string().nullable(),
});
export type InstructorStudentDetail = z.infer<typeof instructorStudentDetailSchema>;

// ---------- Reviews ----------

export const instructorReviewSchema = z.object({
  id: z.string(),
  rating: z.number(),
  comment: z.string(),
  replyComment: z.string().nullable(),
  repliedAt: z.string().nullable(),
  createdAt: z.string(),
  user: userRef,
  course: courseRef,
});

export const instructorReviewsSchema = paginated(instructorReviewSchema);
export type InstructorReview = z.infer<typeof instructorReviewSchema>;
export type InstructorReviews = z.infer<typeof instructorReviewsSchema>;

// ---------- Revenue ----------

const revenueBucket = z.object({
  grossUsdCents: z.number(),
  netUsdCents: z.number(),
});

export const instructorRevenueSchema = z.object({
  stats: z.object({
    month: revenueBucket,
    year: revenueBucket,
    allTime: revenueBucket,
    commissionRate: z.number(),
  }),
  chart: z.array(
    z.object({
      month: z.string(),
      grossUsdCents: z.number(),
      netUsdCents: z.number(),
    }),
  ),
  availableBalanceUsdCents: z.number(),
  transactions: paginated(
    z.object({
      id: z.string(),
      course: courseRef,
      student: userRef,
      paidAt: z.string().nullable(),
      grossUsdCents: z.number(),
      feeUsdCents: z.number(),
      netUsdCents: z.number(),
    }),
  ),
});
export type InstructorRevenue = z.infer<typeof instructorRevenueSchema>;

// ---------- Announcements ----------

export const announcementAudienceSchema = z.enum(["ONE", "SELECTED", "ALL"]);
export type AnnouncementAudience = z.infer<typeof announcementAudienceSchema>;

export const instructorAnnouncementSchema = z.object({
  id: z.string(),
  subject: z.string(),
  body: z.string(),
  audience: announcementAudienceSchema,
  recipientCount: z.number(),
  createdAt: z.string(),
  course: courseRef.nullable(),
});
export const instructorAnnouncementsSchema = paginated(
  instructorAnnouncementSchema,
);
export type InstructorAnnouncement = z.infer<typeof instructorAnnouncementSchema>;
export type InstructorAnnouncements = z.infer<typeof instructorAnnouncementsSchema>;
