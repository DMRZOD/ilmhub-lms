"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, Settings, User } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks";
import { dashboardsForRole } from "@/features/auth/roles";
import type { DashboardUser } from "@/features/student/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function StudentUserMenu({ user }: { user: DashboardUser }) {
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
        className="flex items-center gap-2 rounded-ilm-full bg-ilm-surface py-1 pl-1 pr-3 transition-colors hover:bg-ilm-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ilm-ink"
        aria-label="Foydalanuvchi menyusi"
      >
        <Avatar
          size="sm"
          ink
          src={user.avatarUrl ?? undefined}
          alt={user.name}
          initials={initials(user.name)}
        />
        <span className="hidden flex-col items-start text-left sm:flex">
          <span className="text-t-12 font-semibold text-ilm-ink">
            {user.name}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-fg-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-t-14 font-semibold text-ilm-ink">
            {user.name}
          </span>
          <span className="truncate text-t-12 font-normal text-fg-3">
            {user.email}
          </span>
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
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/student/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </Link>
        </DropdownMenuItem>
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
