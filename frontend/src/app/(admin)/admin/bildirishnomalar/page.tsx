"use client";

import { useRouter } from "next/navigation";
import {
  Award,
  Bell,
  BookOpen,
  CheckCheck,
  CircleDot,
  CreditCard,
  GraduationCap,
  MessageSquare,
  Megaphone,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/student/hooks";
import type {
  NotificationType,
  StudentNotification,
} from "@/features/student/types";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  ENROLLMENT: GraduationCap,
  COURSE_UPDATE: BookOpen,
  NEW_LESSON: Sparkles,
  NEW_REVIEW: Star,
  QUIZ_PASSED: CircleDot,
  CERTIFICATE_ISSUED: Award,
  QA_ANSWER: MessageSquare,
  ORDER_PAID: CreditCard,
  NEW_MESSAGE: MessageSquare,
  ANNOUNCEMENT: Megaphone,
  GENERAL: Bell,
};

const groupDateFmt = new Intl.DateTimeFormat("uz-UZ", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFmt = new Intl.DateTimeFormat("uz-UZ", {
  hour: "2-digit",
  minute: "2-digit",
});

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function groupLabel(date: Date) {
  const today = startOfDay(new Date()).getTime();
  const day = startOfDay(date).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  if (day === today) return "Bugun";
  if (day === today - dayMs) return "Kecha";
  return groupDateFmt.format(date);
}

function groupByDay(items: StudentNotification[]) {
  const map = new Map<string, { label: string; date: number; items: StudentNotification[] }>();
  for (const n of items) {
    const d = new Date(n.createdAt);
    const dayKey = startOfDay(d).toISOString();
    if (!map.has(dayKey)) {
      map.set(dayKey, { label: groupLabel(d), date: startOfDay(d).getTime(), items: [] });
    }
    map.get(dayKey)!.items.push(n);
  }
  return Array.from(map.values()).sort((a, b) => b.date - a.date);
}

export default function AdminBildirishnomalarPage() {
  const query = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();
  const router = useRouter();

  const items = query.data?.items ?? [];
  const unreadCount = query.data?.unreadCount ?? 0;
  const groups = groupByDay(items);

  const onItemClick = (n: StudentNotification) => {
    if (!n.readAt) markOne.mutate(n.id);
    if (n.link) router.push(n.link);
  };

  const onMarkAll = () => {
    markAll.mutate(undefined, {
      onSuccess: () => toast.success("Hammasi o'qilgan deb belgilandi"),
      onError: () => toast.error("Bajarib bo'lmadi"),
    });
  };

  return (
    <div className="flex flex-col gap-sp-6">
      <header className="flex flex-col gap-sp-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-sp-2">
          <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
            Admin
          </span>
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            Bildirishnomalar
          </h1>
          <p className="text-t-14 text-fg-2">
            Tizim bildirishnomalari va xabarlar.
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          iconLeft={CheckCheck}
          onClick={onMarkAll}
          disabled={unreadCount === 0 || markAll.isPending}
        >
          Hammasini o&apos;qilgan deb belgilash
        </Button>
      </header>

      {query.isPending ? (
        <SkeletonList />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-sp-6">
          {groups.map((group) => (
            <section key={group.label} className="flex flex-col gap-sp-3">
              <h2 className="text-t-14 font-semibold uppercase tracking-ilm-wide text-fg-3">
                {group.label}
              </h2>
              <div className="flex flex-col gap-sp-2">
                {group.items.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onClick={() => onItemClick(n)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  notification,
  onClick,
}: {
  notification: StudentNotification;
  onClick: () => void;
}) {
  const unread = !notification.readAt;
  const IconCmp = TYPE_ICON[notification.type] ?? Bell;
  const time = timeFmt.format(new Date(notification.createdAt));

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-sp-3 rounded-ilm-md border border-ilm-border bg-ilm-paper p-sp-4 text-left transition-colors hover:bg-ilm-surface",
        unread && "border-ilm-ink/15 bg-ilm-surface",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-ilm-md",
          unread ? "bg-ilm-ink text-white" : "bg-ilm-surface text-fg-2",
        )}
      >
        <Icon icon={IconCmp} size={18} />
      </div>
      <div className="min-w-0 flex flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-sp-2">
          <span className={cn("truncate text-t-14 text-ilm-ink", unread ? "font-bold" : "font-semibold")}>
            {notification.title}
          </span>
          <span className="shrink-0 text-t-12 text-fg-3">{time}</span>
        </div>
        <p className="line-clamp-2 text-t-12 text-fg-2">{notification.body}</p>
      </div>
      {unread && (
        <span aria-label="O'qilmagan" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ilm-ink" />
      )}
    </button>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-sp-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} padding="md" className="flex items-start gap-sp-3">
          <Skeleton className="h-10 w-10 rounded-ilm-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-sp-4 py-sp-12 text-center">
      <h3 className="text-t-24 font-bold text-ilm-ink">Yuklab bo&apos;lmadi</h3>
      <Button variant="primary" size="md" onClick={onRetry}>Qayta yuklash</Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-ilm-full bg-ilm-surface text-fg-2">
        <Bell className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="text-t-24 font-bold text-ilm-ink">Bildirishnomalar yo&apos;q</h3>
      <p className="max-w-md text-t-14 text-fg-2">Yangi xabarlar mana shu yerda paydo bo&apos;ladi.</p>
    </div>
  );
}
