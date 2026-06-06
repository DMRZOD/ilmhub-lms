"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { STUDENT_NAV_ITEMS, type StudentNavItem } from "./nav-items";
import { SidebarNav } from "./sidebar-nav";

export function MobileNav({
  items = STUDENT_NAV_ITEMS,
  homeHref = "/student/dashboard",
  subtitle = "Talaba paneli",
}: {
  items?: StudentNavItem[];
  homeHref?: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="grid h-11 w-11 place-items-center rounded-ilm-md bg-ilm-surface text-ilm-ink transition-colors hover:bg-ilm-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ilm-ink md:hidden"
        aria-label="Menyu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-72 flex-col gap-6 bg-ilm-ink p-0 text-white"
      >
        <SheetTitle className="sr-only">Menyu</SheetTitle>
        <div className="flex items-center gap-3 px-4 pt-6">
          <Link
            href={homeHref}
            onClick={() => setOpen(false)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-ilm-lg bg-white text-t-18 font-extrabold text-ilm-ink"
            aria-label="IlmHub"
          >
            i.
          </Link>
          <div className="flex flex-col leading-tight">
            <span className="text-t-14 font-bold text-white">IlmHub</span>
            <span className="text-t-12 text-white/60">{subtitle}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <SidebarNav items={items} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
