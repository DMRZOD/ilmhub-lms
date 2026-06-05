"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, LayoutDashboard, LogOut, Settings } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks";
import { ROLE_LABELS } from "@/features/auth/labels";
import { dashboardsForRole } from "@/features/auth/roles";
import type { Role, User } from "@/features/auth/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_BADGE_TONE: Record<Role, NonNullable<BadgeProps["tone"]>> = {
  ADMIN: "error",
  INSTRUCTOR: "info",
  STUDENT: "neutral",
};

export function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  const logout = useLogout();

  const handleSignOut = async () => {
    await logout.mutateAsync();
    router.push("/");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-ilm-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ilm-ink"
        aria-label="Foydalanuvchi menyusi"
      >
        <Avatar
          size="sm"
          ink
          src={user.avatarUrl ?? undefined}
          alt={user.name}
          initials={initials(user.name)}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1.5">
          <span className="truncate text-t-14 font-semibold text-ilm-ink">
            {user.name}
          </span>
          <span className="truncate text-t-12 font-normal text-fg-3">
            {user.email}
          </span>
          <Badge tone={ROLE_BADGE_TONE[user.role]} className="self-start">
            {ROLE_LABELS[user.role]}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dashboardsForRole(user.role).map((target) => (
          <DropdownMenuItem key={target.role} asChild>
            <Link href={target.href} className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              {target.label}
            </Link>
          </DropdownMenuItem>
        ))}
        {user.role === "STUDENT" && (
          <DropdownMenuItem asChild>
            <Link href="/student/become-instructor" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Ustoz bo&apos;lish
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sozlamalar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            void handleSignOut();
          }}
          className="flex items-center gap-2 text-ilm-ink"
          disabled={logout.isPending}
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
