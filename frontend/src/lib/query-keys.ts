import type {
  CourseFiltersInput,
  EnrollmentFiltersInput,
  FavoritesFiltersInput,
  InstructorFiltersInput,
} from "@/types/api";

export const coursesKeys = {
  all: ["courses"] as const,
  lists: () => [...coursesKeys.all, "list"] as const,
  list: (filters: CourseFiltersInput) =>
    [...coursesKeys.lists(), filters] as const,
  featured: (limit?: number) =>
    [...coursesKeys.all, "featured", { limit }] as const,
  details: () => [...coursesKeys.all, "detail"] as const,
  detail: (slug: string) => [...coursesKeys.details(), slug] as const,
  reviewsRoot: (slug: string) =>
    [...coursesKeys.detail(slug), "reviews"] as const,
  reviews: (slug: string, params: Record<string, unknown> = {}) =>
    [...coursesKeys.reviewsRoot(slug), params] as const,
};

export const categoriesKeys = {
  all: ["categories"] as const,
  lists: () => [...categoriesKeys.all, "list"] as const,
  list: () => [...categoriesKeys.lists()] as const,
  details: () => [...categoriesKeys.all, "detail"] as const,
  detail: (slug: string, page?: number, limit?: number) =>
    [...categoriesKeys.details(), slug, { page, limit }] as const,
};

export const studentKeys = {
  all: ["student"] as const,
  enrollmentsRoot: () => [...studentKeys.all, "enrollments"] as const,
  enrollments: (filters: EnrollmentFiltersInput) =>
    [...studentKeys.enrollmentsRoot(), filters] as const,
  favoritesRoot: () => [...studentKeys.all, "favorites"] as const,
  favorites: (filters: FavoritesFiltersInput) =>
    [...studentKeys.favoritesRoot(), filters] as const,
  certificates: () => [...studentKeys.all, "certificates"] as const,
  achievements: () => [...studentKeys.all, "achievements"] as const,
};

export const ordersKeys = {
  all: ["orders"] as const,
  lists: () => [...ordersKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...ordersKeys.lists(), params] as const,
  details: () => [...ordersKeys.all, "detail"] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
};

export const learningKeys = {
  all: ["learning"] as const,
  lesson: (id: string) => [...learningKeys.all, "lesson", id] as const,
  playbackToken: (id: string) =>
    [...learningKeys.all, "playback-token", id] as const,
  preview: (id: string) => [...learningKeys.all, "preview", id] as const,
  quiz: (lessonId: string) => [...learningKeys.all, "quiz", lessonId] as const,
  quizAttempts: (quizId: string) =>
    [...learningKeys.all, "quiz-attempts", quizId] as const,
  coding: (lessonId: string) =>
    [...learningKeys.all, "coding", lessonId] as const,
  codingSubmissions: (exerciseId: string) =>
    [...learningKeys.all, "coding-submissions", exerciseId] as const,
};

export const blogKeys = {
  all: ["blog"] as const,
  comments: (slug: string) => [...blogKeys.all, "comments", slug] as const,
};

export const notesKeys = {
  all: ["notes"] as const,
  lesson: (lessonId: string) => [...notesKeys.all, "lesson", lessonId] as const,
  course: (courseId: string) => [...notesKeys.all, "course", courseId] as const,
};

export const qaKeys = {
  all: ["qa"] as const,
  lists: () => [...qaKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...qaKeys.lists(), params] as const,
  details: () => [...qaKeys.all, "detail"] as const,
  detail: (id: string) => [...qaKeys.details(), id] as const,
};

export const instructorsKeys = {
  all: ["instructors"] as const,
  lists: () => [...instructorsKeys.all, "list"] as const,
  list: (filters: InstructorFiltersInput) =>
    [...instructorsKeys.lists(), filters] as const,
  details: () => [...instructorsKeys.all, "detail"] as const,
  detail: (id: string) => [...instructorsKeys.details(), id] as const,
};

export const announcementsKeys = {
  all: ["announcements"] as const,
  course: (courseId: string) =>
    [...announcementsKeys.all, "course", courseId] as const,
};

export const profileKeys = {
  all: ["profile"] as const,
  details: () => [...profileKeys.all, "detail"] as const,
  detail: (id: string) => [...profileKeys.details(), id] as const,
};

export const instructorApplicationKeys = {
  all: ["instructor-application"] as const,
  me: () => [...instructorApplicationKeys.all, "me"] as const,
};

export const instructorDashboardKeys = {
  all: ["instructor-dashboard"] as const,
  root: () => [...instructorDashboardKeys.all] as const,
};

export const instructorStudentKeys = {
  all: ["instructor-students"] as const,
  lists: () => [...instructorStudentKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...instructorStudentKeys.lists(), params] as const,
  detail: (id: string) => [...instructorStudentKeys.all, "detail", id] as const,
};

export const instructorReviewKeys = {
  all: ["instructor-reviews"] as const,
  lists: () => [...instructorReviewKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...instructorReviewKeys.lists(), params] as const,
};

export const instructorRevenueKeys = {
  all: ["instructor-revenue"] as const,
  list: (page: number) => [...instructorRevenueKeys.all, { page }] as const,
};

export const adminAnalyticsKeys = {
  all: ["admin", "analytics"] as const,
  overview: () => [...adminAnalyticsKeys.all, "overview"] as const,
  usersGrowth: () => [...adminAnalyticsKeys.all, "users-growth"] as const,
  revenue: () => [...adminAnalyticsKeys.all, "revenue"] as const,
  topCourses: () => [...adminAnalyticsKeys.all, "top-courses"] as const,
  topCategories: () => [...adminAnalyticsKeys.all, "top-categories"] as const,
};

export const adminUsersKeys = {
  all: ["admin", "users"] as const,
  lists: () => [...adminUsersKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...adminUsersKeys.lists(), params] as const,
  details: () => [...adminUsersKeys.all, "detail"] as const,
  detail: (id: string) => [...adminUsersKeys.details(), id] as const,
};

export const adminInstructorsKeys = {
  all: ["admin", "instructors"] as const,
  lists: () => [...adminInstructorsKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...adminInstructorsKeys.lists(), params] as const,
  applicationsRoot: () => [...adminInstructorsKeys.all, "applications"] as const,
  applications: (params: Record<string, unknown>) =>
    [...adminInstructorsKeys.applicationsRoot(), params] as const,
};

export const adminCoursesKeys = {
  all: ["admin", "courses"] as const,
  lists: () => [...adminCoursesKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...adminCoursesKeys.lists(), params] as const,
  details: () => [...adminCoursesKeys.all, "detail"] as const,
  detail: (id: string) => [...adminCoursesKeys.details(), id] as const,
};

export const adminRefundsKeys = {
  all: ["admin", "refunds"] as const,
  lists: () => [...adminRefundsKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...adminRefundsKeys.lists(), params] as const,
};

export const adminReportsKeys = {
  all: ["admin", "reports"] as const,
  lists: () => [...adminReportsKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...adminReportsKeys.lists(), params] as const,
};

export const myRefundsKeys = {
  all: ["my-refunds"] as const,
  list: () => [...myRefundsKeys.all, "list"] as const,
};

export const adminBlogKeys = {
  all: ["admin", "blog"] as const,
  lists: () => [...adminBlogKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...adminBlogKeys.lists(), params] as const,
  details: () => [...adminBlogKeys.all, "detail"] as const,
  detail: (id: string) => [...adminBlogKeys.details(), id] as const,
  categories: () => [...adminBlogKeys.all, "categories"] as const,
};

export const adminCmsKeys = {
  all: ["admin", "cms"] as const,
  categories: () => [...adminCmsKeys.all, "categories"] as const,
  achievements: () => [...adminCmsKeys.all, "achievements"] as const,
  testimonials: () => [...adminCmsKeys.all, "testimonials"] as const,
  faqs: () => [...adminCmsKeys.all, "faqs"] as const,
  home: () => [...adminCmsKeys.all, "home"] as const,
};

export const adminSettingsKeys = {
  all: ["admin", "settings"] as const,
  overview: () => [...adminSettingsKeys.all, "overview"] as const,
  audit: (params: Record<string, unknown>) =>
    [...adminSettingsKeys.all, "audit", params] as const,
};

export const contentKeys = {
  all: ["content"] as const,
  home: () => [...contentKeys.all, "home"] as const,
};

export const instructorAnnouncementKeys = {
  all: ["instructor-announcements"] as const,
  lists: () => [...instructorAnnouncementKeys.all, "list"] as const,
  list: (page: number) => [...instructorAnnouncementKeys.lists(), { page }] as const,
};

export const messagesKeys = {
  all: ["messages"] as const,
  conversations: () => [...messagesKeys.all, "conversations"] as const,
  conversation: (id: string, page: number) =>
    [...messagesKeys.all, "conversation", id, { page }] as const,
  unread: () => [...messagesKeys.all, "unread"] as const,
};
