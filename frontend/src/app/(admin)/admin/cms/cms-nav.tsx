"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { ADMIN_CMS_TEXT as T } from "@/features/admin/labels";

const LINKS = [
  { href: "/admin/cms/categories", label: T.tabs.categories },
  { href: "/admin/cms/achievements", label: T.tabs.achievements },
  { href: "/admin/cms/home", label: T.tabs.home },
];

export function CmsNav() {
  const path = usePathname();
  return (
    <div className="flex flex-col gap-sp-1">
      <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
        {T.title}
      </h1>
      <p className="text-t-14 text-fg-2">{T.subtitle}</p>
      <nav className="mt-sp-3 inline-flex w-full gap-sp-6 overflow-x-auto border-b border-ilm-border">
        {LINKS.map((l) => {
          const active = path === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "whitespace-nowrap border-b-2 py-sp-3 text-t-14 font-semibold transition-colors",
                active
                  ? "border-ilm-ink text-ilm-ink"
                  : "border-transparent text-fg-2 hover:text-ilm-ink",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
