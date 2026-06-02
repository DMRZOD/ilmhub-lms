import type { CourseCard, CourseLevel, CourseLanguage } from "@/types/api";
import type { Role } from "@/features/auth/types";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
};

export type CurrentLesson = {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  thumbnailUrl: string | null;
  lastPositionSeconds: number;
  progress: number;
  completedLessons: number;
  lessonsCount: number;
};

export type InProgressCourse = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  lessonsCount: number;
  durationMinutes: number;
  completedLessons: number;
  progress: number;
  instructor: { id: string; name: string; avatarUrl: string | null };
  category: { id: string; slug: string; name: string; iconName: string | null };
  enrolledAt: string;
};

export type WeeklyHoursPoint = { date: string; hours: number };

export type RecentAchievement = {
  id: string;
  earnedAt: string;
  achievement: {
    id: string;
    code: string;
    title: string;
    description: string;
    iconName: string | null;
  };
};

export type DashboardResponse = {
  user: DashboardUser;
  streakDays: number;
  todayMinutes: number;
  currentLesson: CurrentLesson | null;
  inProgressCourses: InProgressCourse[];
  weeklyHours: WeeklyHoursPoint[];
  recentAchievements: RecentAchievement[];
  recommendedCourses: CourseCard[];
};

export type NotificationType =
  | "ENROLLMENT"
  | "COURSE_UPDATE"
  | "NEW_LESSON"
  | "NEW_REVIEW"
  | "QUIZ_PASSED"
  | "CERTIFICATE_ISSUED"
  | "QA_ANSWER"
  | "ORDER_PAID"
  | "NEW_MESSAGE"
  | "ANNOUNCEMENT"
  | "GENERAL";

export type StudentNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationListResponse = {
  items: StudentNotification[];
  unreadCount: number;
  nextCursor: string | null;
};

export type CertificateCourse = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  durationMinutes: number;
  instructor: { name: string };
};

export type StudentCertificate = {
  id: string;
  certificateNumber: string;
  issuedAt: string;
  course: CertificateCourse;
};

export type CertificatesResponse = {
  items: StudentCertificate[];
};

export type AchievementCategory =
  | "BOSHLANISH"
  | "DAVOMIY"
  | "TUGATISH"
  | "SOTSIAL";

export type StudentAchievement = {
  id: string;
  code: string;
  title: string;
  description: string;
  iconName: string | null;
  category: AchievementCategory;
  earned: boolean;
  earnedAt: string | null;
};

export type AchievementsResponse = {
  items: StudentAchievement[];
  earnedCount: number;
  totalCount: number;
};

export type { CourseCard, CourseLevel, CourseLanguage };
