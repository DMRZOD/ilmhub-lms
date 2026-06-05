"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BellOff, CheckCheck, Loader2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/student/hooks";
import type { StudentNotification } from "@/features/student/types";

function useNotificationsHref(): string {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return "/admin/bildirishnomalar";
  if (pathname.startsWith("/instructor")) return "/instructor/bildirishnomalar";
  return "/student/notifications";
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.round(diff / 60000);
  if (m < 1) return "hozir";
  if (m < 60) return `${m} daq oldin`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} kun oldin`;
  return new Date(iso).toLocaleDateString("uz-UZ");
}

function NotificationRow({
  item,
  onMarkRead,
}: {
  item: StudentNotification;
  onMarkRead: (id: string) => void;
}) {
  const isUnread = item.readAt === null;
  const className = cn(
    "flex w-full gap-3 px-3 py-3 text-left transition-colors hover:bg-ilm-surface",
    isUnread && "bg-ilm-surface/50",
  );

  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
          isUnread ? "bg-ilm-info" : "bg-transparent",
        )}
      />
      <div className="flex-1 space-y-1">
        <p className="line-clamp-2 text-t-14 font-semibold text-ilm-ink">
          {item.title}
        </p>
        <p className="line-clamp-2 text-t-12 text-fg-2">{item.body}</p>
        <p className="text-t-12 text-fg-3">{formatRelative(item.createdAt)}</p>
      </div>
    </>
  );

  if (item.link) {
    return (
      <Link
        href={item.link}
        className={className}
        onClick={() => isUnread && onMarkRead(item.id)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => isUnread && onMarkRead(item.id)}
    >
      {content}
    </button>
  );
}

export function NotificationsBell({
  triggerClassName,
}: {
  /** Override the bell button styling (e.g. to match a plain-icon navbar). */
  triggerClassName?: string;
} = {}) {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const allHref = useNotificationsHref();

  const unreadCount = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          triggerClassName ??
          "relative grid h-11 w-11 place-items-center rounded-ilm-md bg-ilm-surface text-ilm-ink transition-colors hover:bg-ilm-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ilm-ink"
        }
        aria-label="Bildirishnomalar"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ilm-error ring-2 ring-ilm-paper"
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="flex items-center justify-between border-b border-ilm-border px-3 py-3">
          <div className="flex flex-col">
            <span className="text-t-14 font-bold text-ilm-ink">
              Bildirishnomalar
            </span>
            <span className="text-t-12 text-fg-3">
              {unreadCount > 0
                ? `${unreadCount} o'qilmagan`
                : "Barchasi o'qilgan"}
            </span>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="flex items-center gap-1 rounded-ilm-md px-2 py-1 text-t-12 font-medium text-ilm-ink transition-colors hover:bg-ilm-surface disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Hammasini o&apos;qilgan
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-fg-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-t-12">Yuklanmoqda...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-fg-3">
              <BellOff className="h-6 w-6" />
              <span className="text-t-12">Hozircha bildirishnoma yo&apos;q</span>
            </div>
          ) : (
            items.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onMarkRead={(id) => markRead.mutate(id)}
              />
            ))
          )}
        </div>
        <Link
          href={allHref}
          className="block border-t border-ilm-border px-3 py-2.5 text-center text-t-12 font-semibold text-ilm-ink transition-colors hover:bg-ilm-surface"
        >
          Hammasini ko&apos;rish →
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
