export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio?: string | null;
  avatarUrl?: string | null;
  website?: string | null;
  telegram?: string | null;
  github?: string | null;
  twitter?: string | null;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
};
