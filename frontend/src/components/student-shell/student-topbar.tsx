"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks";
import type { DashboardUser } from "@/features/student/types";

import { MobileNav } from "./mobile-nav";
import { NotificationsBell } from "./notifications-bell";
import { StudentUserMenu } from "./user-menu";

export function StudentTopbar() {
  const router = useRouter();
  const { data: authUser } = useAuth();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/courses?q=${encodeURIComponent(trimmed)}`);
  };

  const user: DashboardUser | null = authUser
    ? {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        avatarUrl: authUser.avatarUrl ?? null,
        role: authUser.role,
      }
    : null;

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-ilm-border bg-white/50 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <MobileNav />
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full max-w-md flex-1 items-center"
        role="search"
      >
        <Search className="pointer-events-none absolute left-4 h-4 w-4 text-fg-3" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Kurs qidirish..."
          className="rounded-ilm-full pl-11"
          aria-label="Kurs qidirish"
        />
      </form>
      <div className="ml-auto flex items-center gap-2">
        <NotificationsBell />
        {user && <StudentUserMenu user={user} />}
      </div>
    </header>
  );
}
