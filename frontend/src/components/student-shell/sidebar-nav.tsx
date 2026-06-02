"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useUnreadMessages } from "@/features/messages/hooks";

import { STUDENT_NAV_ITEMS, type StudentNavItem } from "./nav-items";

export function SidebarNav({
  items = STUDENT_NAV_ITEMS,
  collapsed = false,
  onNavigate,
}: {
  items?: StudentNavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { data: unread = 0 } = useUnreadMessages();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);
        const badge = item.href.endsWith("/messages") ? unread : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-ilm-md px-3 py-2.5 text-t-14 font-medium transition-colors duration-base ease-ilm-out",
              isActive
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white",
              collapsed && "justify-center px-0",
            )}
            aria-current={isActive ? "page" : undefined}
            title={collapsed ? item.label : undefined}
          >
            <span className="relative shrink-0">
              <Icon className="h-5 w-5" />
              {badge > 0 && (
                <span
                  className={cn(
                    "absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-ilm-full bg-ilm-error px-1 text-[10px] font-bold text-white",
                    collapsed && "-right-1 -top-1",
                  )}
                >
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </span>
            {!collapsed && (
              <span className="flex-1 truncate">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
