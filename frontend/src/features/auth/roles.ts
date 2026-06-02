import type { Role } from "./types";

/** Maps a user role to the home/dashboard route they should land on after auth. */
const ROLE_DASHBOARD_PATH: Record<Role, string> = {
  STUDENT: "/student/dashboard",
  INSTRUCTOR: "/instructor/dashboard",
  ADMIN: "/admin",
};

export function dashboardPathForRole(role: Role): string {
  return ROLE_DASHBOARD_PATH[role] ?? "/student/dashboard";
}
