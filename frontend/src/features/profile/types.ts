import type { Role } from "@/features/auth/types";
import type { CourseCard } from "@/types/api";

export type ProfileCertificate = {
  id: string;
  certificateNumber: string;
  issuedAt: string;
  pdfUrl: string | null;
  course: {
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string | null;
  };
};

export type ProfileAchievement = {
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

export type PublicProfile = {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  telegram: string | null;
  github: string | null;
  twitter: string | null;
  role: Role;
  createdAt: string;
  completedCourses: CourseCard[];
  certificates: ProfileCertificate[];
  achievements: ProfileAchievement[];
  stats: {
    completedCount: number;
    certificatesCount: number;
    achievementsCount: number;
  };
};
