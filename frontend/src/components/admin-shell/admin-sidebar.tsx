"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/student-shell/sidebar-nav";

import { ADMIN_NAV_ITEMS } from "./nav-items";

const STORAGE_KEY = "ilm:admin-sidebar:collapsed";

export function AdminSidebar({ className }: { className?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed, hydrated]);

  const toggle = (
    <button
      type="button"
      onClick={() => setCollapsed((c) => !c)}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-ilm-md text-white/70 transition-colors duration-base ease-ilm-out hover:bg-white/5 hover:text-white",
        collapsed ? "" : "ml-auto self-start",
      )}
      aria-label={
        collapsed ? "Yon panelni kengaytirish" : "Yon panelni yig'ish"
      }
    >
      {collapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col bg-ilm-ink text-white transition-[width] duration-base ease-ilm-out",
        collapsed ? "w-[72px]" : "w-[260px]",
        className,
      )}
    >
      <div
        className={cn(
          "flex gap-2 pb-6 pt-6",
          collapsed ? "flex-col items-center px-0" : "items-center px-4",
        )}
      >
        <Link
          href="/"
          className={cn("flex shrink-0", !collapsed && "flex-col gap-1")}
          aria-label="IlmHub bosh sahifa"
        >
          {collapsed ? (
            <Image
              src="/logo-short-white.svg"
              alt="IlmHub"
              width={44}
              height={44}
              className="h-11 w-11 rounded-ilm-lg ring-1 ring-white/10"
            />
          ) : (
            <>
              <Image
                src="/logo-white.svg"
                alt="IlmHub"
                width={168}
                height={31}
                priority
                className="h-5 w-auto"
              />
              <span className="text-t-12 text-white/60">Admin paneli</span>
            </>
          )}
        </Link>
        {toggle}
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <SidebarNav items={ADMIN_NAV_ITEMS} collapsed={collapsed} />
      </div>
    </aside>
  );
}
