"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  DollarSign,
  Inbox,
  Loader2,
  MessageSquare,
  Plus,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatShortDate } from "@/lib/format";
import { useInstructorDashboard } from "@/features/instructor/hooks";

// recharts is heavy; load the chart client-only and lazily so it stays out of
// the dashboard route's initial JS until the data renders.
const SalesChart = dynamic(
  () => import("./sales-chart").then((m) => m.SalesChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 w-full animate-pulse rounded-ilm-xl bg-ilm-surface" />
    ),
  },
);

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card padding="md" className="flex flex-col gap-sp-3">
      <div className="flex items-center justify-between">
        <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
          {label}
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-ilm-full bg-ilm-surface text-ilm-ink">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
        {value}
      </div>
      {hint && <p className="text-t-12 text-fg-3">{hint}</p>}
    </Card>
  );
}

function SectionHeader({
  title,
  badge,
}: {
  title: string;
  badge?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-t-18 font-bold text-ilm-ink">{title}</h3>
      {badge != null && badge > 0 && (
        <span className="grid h-6 min-w-6 place-items-center rounded-ilm-full bg-ilm-ink px-2 text-t-12 font-bold text-white">
          {badge}
        </span>
      )}
    </div>
  );
}

function EmptyRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center gap-sp-2 py-sp-6 text-center">
      <Icon className="h-6 w-6 text-ilm-muted-2" />
      <p className="text-t-14 text-fg-3">{text}</p>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Loader2 className="h-8 w-8 animate-spin text-ilm-ink" />
    </div>
  );
}

export function UstozDashboardContent() {
  const { data, isLoading, isError } = useInstructorDashboard();

  if (isLoading) return <PageLoader />;

  if (isError || !data) {
    return (
      <Card padding="lg" className="flex items-center gap-sp-3">
        <span className="grid h-10 w-10 place-items-center rounded-ilm-full bg-ilm-error-bg text-ilm-error">
          <AlertCircle className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-t-16 font-bold text-ilm-ink">
            Ma&apos;lumotni yuklab bo&apos;lmadi
          </h3>
          <p className="text-t-14 text-fg-2">
            Iltimos, sahifani yangilang yoki keyinroq urinib ko&apos;ring.
          </p>
        </div>
      </Card>
    );
  }

  const { stats, salesChart, recentEnrollments, recentReviews, pendingQa } =
    data;

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-sp-1">
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            Ustoz dashboardi
          </h1>
          <p className="text-t-14 text-fg-2">
            {stats.coursesCount} ta kurs · {stats.publishedCoursesCount} ta
            chop etilgan
          </p>
        </div>
        <Button asChild size="lg" iconLeft={Plus} className="self-start">
          <Link href="/instructor/courses/new">Yangi kurs yaratish</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-sp-4 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Jami talabalar"
          value={stats.totalStudents.toLocaleString("en-US")}
        />
        <StatCard
          icon={DollarSign}
          label="Bu oygi daromad"
          value={money(stats.revenueThisMonthUsdCents)}
          hint={`Jami: ${money(stats.revenueAllTimeUsdCents)}`}
        />
        <StatCard
          icon={Star}
          label="Reyting"
          value={stats.ratingAvg ? stats.ratingAvg.toFixed(2) : "—"}
        />
        <StatCard
          icon={TrendingUp}
          label="Haftalik sotuvlar"
          value={stats.salesThisWeek.toLocaleString("en-US")}
        />
      </div>

      <Card padding="lg" className="flex flex-col gap-sp-4">
        <div>
          <h3 className="text-t-18 font-bold text-ilm-ink">Sotuvlar</h3>
          <p className="text-t-12 text-fg-3">So&apos;nggi 30 kun daromadi</p>
        </div>
        <SalesChart data={salesChart} />
      </Card>

      <div className="grid gap-sp-4 lg:grid-cols-2">
        <Card padding="lg" className="flex flex-col gap-sp-4">
          <SectionHeader title="So'nggi yozilishlar" />
          {recentEnrollments.length === 0 ? (
            <EmptyRow icon={Inbox} text="Hozircha yangi talabalar yo'q" />
          ) : (
            <ul className="flex flex-col gap-sp-3">
              {recentEnrollments.map((e) => (
                <li key={e.id} className="flex items-center gap-sp-3">
                  <Avatar
                    size="sm"
                    ink
                    src={e.user.avatarUrl ?? undefined}
                    alt={e.user.name}
                    initials={initials(e.user.name)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-t-14 font-semibold text-ilm-ink">
                      {e.user.name}
                    </p>
                    <p className="truncate text-t-12 text-fg-3">
                      {e.course.title}
                    </p>
                  </div>
                  <span className="shrink-0 text-t-12 text-fg-3">
                    {formatShortDate(e.enrolledAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card padding="lg" className="flex flex-col gap-sp-4">
          <SectionHeader title="Javobsiz savollar" badge={pendingQa.count} />
          {pendingQa.items.length === 0 ? (
            <EmptyRow icon={MessageSquare} text="Javobsiz savollar yo'q" />
          ) : (
            <ul className="flex flex-col gap-sp-3">
              {pendingQa.items.map((q) => (
                <li key={q.id} className="flex flex-col gap-0.5">
                  <p className="truncate text-t-14 font-semibold text-ilm-ink">
                    {q.title}
                  </p>
                  <p className="truncate text-t-12 text-fg-3">
                    {q.course.title} · {formatShortDate(q.lastActivityAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card padding="lg" className="flex flex-col gap-sp-4">
        <SectionHeader title="So'nggi sharhlar" />
        {recentReviews.length === 0 ? (
          <EmptyRow icon={Star} text="Hozircha sharhlar yo'q" />
        ) : (
          <ul className="flex flex-col gap-sp-4">
            {recentReviews.map((r) => (
              <li key={r.id} className="flex flex-col gap-sp-2">
                <div className="flex items-center gap-sp-3">
                  <Avatar
                    size="sm"
                    ink
                    src={r.user.avatarUrl ?? undefined}
                    alt={r.user.name}
                    initials={initials(r.user.name)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-t-14 font-semibold text-ilm-ink">
                      {r.user.name}
                    </p>
                    <p className="truncate text-t-12 text-fg-3">
                      {r.course.title}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-t-14 font-bold text-ilm-ink">
                    <Star className="h-4 w-4 fill-current" />
                    {r.rating}
                  </span>
                </div>
                <p className="line-clamp-2 text-t-14 text-fg-2">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
