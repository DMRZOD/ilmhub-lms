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

export type DashboardTarget = { role: Role; href: string; label: string };

const DASHBOARD_TARGETS: Record<Role, DashboardTarget> = {
  ADMIN: { role: "ADMIN", href: "/admin", label: "Admin paneli" },
  INSTRUCTOR: {
    role: "INSTRUCTOR",
    href: "/instructor/dashboard",
    label: "Ustoz paneli",
  },
  STUDENT: { role: "STUDENT", href: "/student/dashboard", label: "Talaba paneli" },
};

const ROLE_RANK: Record<Role, number> = { STUDENT: 0, INSTRUCTOR: 1, ADMIN: 2 };

/**
 * Dashboards a user of `role` may switch between, their own dashboard first.
 * Mirrors the hierarchical access the route-group layouts enforce:
 * STUDENT → [student]; INSTRUCTOR → [instructor, student];
 * ADMIN → [admin, instructor, student].
 */
export function dashboardsForRole(role: Role): DashboardTarget[] {
  const own = DASHBOARD_TARGETS[role];
  const others = Object.values(DASHBOARD_TARGETS).filter(
    (t) => t.role !== role && ROLE_RANK[t.role] < ROLE_RANK[role],
  );
  return [own, ...others];
}
