"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  BookOpen,
  DollarSign,
  FileCheck2,
  GraduationCap,
  ShieldAlert,
  Star,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  EmptyState,
  ErrorCard,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import {
  formatCompactCount,
  formatShortDate,
  formatUsd,
  initialsOf,
} from "@/lib/format";
import {
  useAdminOverview,
  useAdminRevenue,
  useAdminTopCategories,
  useAdminTopCourses,
  useAdminUsersGrowth,
} from "@/features/admin/hooks";

// recharts is heavy; load the charts client-only and lazily so they stay out of
// the admin dashboard route's initial JS until the data renders.
const chartFallback = () => (
  <div className="h-56 w-full animate-pulse rounded-ilm-xl bg-ilm-surface" />
);
const UsersGrowthChart = dynamic(
  () => import("./dashboard-charts").then((m) => m.UsersGrowthChart),
  { ssr: false, loading: chartFallback },
);
const RevenueChart = dynamic(
  () => import("./dashboard-charts").then((m) => m.RevenueChart),
  { ssr: false, loading: chartFallback },
);
const CategoriesChart = dynamic(
  () => import("./dashboard-charts").then((m) => m.CategoriesChart),
  { ssr: false, loading: chartFallback },
);

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

export function AdminDashboardContent() {
  const overview = useAdminOverview();
  const usersGrowth = useAdminUsersGrowth();
  const revenue = useAdminRevenue();
  const topCourses = useAdminTopCourses();
  const topCategories = useAdminTopCategories();

  if (overview.isLoading) return <PageLoader />;
  if (overview.isError || !overview.data) return <ErrorCard />;

  const { stats, pendingCourses, pendingApplications } = overview.data;

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-1">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Boshqaruv paneli
        </h1>
        <p className="text-t-14 text-fg-2">
          Platforma ko&apos;rsatkichlari va moderatsiya
        </p>
      </div>

      <div className="grid grid-cols-2 gap-sp-4 lg:grid-cols-5">
        <StatCard
          icon={Users}
          label="Foydalanuvchilar"
          value={formatCompactCount(stats.totalUsers)}
        />
        <StatCard
          icon={BookOpen}
          label="Kurslar"
          value={formatCompactCount(stats.totalCourses)}
          hint={`${stats.publishedCourses} nashr qilingan`}
        />
        <StatCard
          icon={DollarSign}
          label="Bu oy (MRR)"
          value={formatUsd(stats.mrrUsdCents)}
        />
        <StatCard
          icon={UserCheck}
          label="Aktiv talabalar"
          value={formatCompactCount(stats.activeStudents)}
        />
        <StatCard
          icon={ShieldAlert}
          label="Moderatsiya"
          value={formatCompactCount(stats.pendingModeration.total)}
          hint={`${stats.pendingModeration.courses} kurs · ${stats.pendingModeration.applications} ariza`}
        />
      </div>

      <div className="grid gap-sp-4 lg:grid-cols-2">
        <Card padding="lg" className="flex flex-col gap-sp-4">
          <div>
            <h3 className="text-t-18 font-bold text-ilm-ink">
              Foydalanuvchilar o&apos;sishi
            </h3>
            <p className="text-t-12 text-fg-3">
              So&apos;nggi 30 kun · yangi ro&apos;yxatdan o&apos;tishlar
            </p>
          </div>
          {usersGrowth.data ? (
            <UsersGrowthChart data={usersGrowth.data} />
          ) : (
            <PageLoader />
          )}
        </Card>

        <Card padding="lg" className="flex flex-col gap-sp-4">
          <div>
            <h3 className="text-t-18 font-bold text-ilm-ink">Daromad</h3>
            <p className="text-t-12 text-fg-3">
              So&apos;nggi 12 oy · yalpi sotuv (GMV)
            </p>
          </div>
          {revenue.data ? <RevenueChart data={revenue.data} /> : <PageLoader />}
        </Card>
      </div>

      <div className="grid gap-sp-4 lg:grid-cols-3">
        <Card padding="none" className="overflow-hidden lg:col-span-2">
          <div className="border-b border-ilm-border px-sp-4 py-sp-4">
            <h3 className="text-t-18 font-bold text-ilm-ink">Top kurslar</h3>
          </div>
          {!topCourses.data || topCourses.data.length === 0 ? (
            <EmptyState icon={BookOpen} text="Hozircha kurslar yo'q" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-ilm-border text-t-12 uppercase tracking-ilm-wide text-fg-3">
                    <th className="px-sp-4 py-sp-3 font-semibold">Kurs</th>
                    <th className="px-sp-4 py-sp-3 font-semibold">Ustoz</th>
                    <th className="px-sp-4 py-sp-3 text-right font-semibold">
                      O&apos;quvchilar
                    </th>
                    <th className="px-sp-4 py-sp-3 text-right font-semibold">
                      Reyting
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topCourses.data.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-ilm-border last:border-0"
                    >
                      <td className="max-w-[240px] px-sp-4 py-sp-3">
                        <Link href={`/courses/${c.slug}`} className="block">
                          <p className="truncate text-t-14 font-semibold text-ilm-ink">
                            {c.title}
                          </p>
                          {c.category && (
                            <p className="truncate text-t-12 text-fg-3">
                              {c.category}
                            </p>
                          )}
                        </Link>
                      </td>
                      <td className="px-sp-4 py-sp-3">
                        <div className="flex items-center gap-sp-2">
                          <Avatar
                            size="sm"
                            ink
                            src={c.instructor.avatarUrl ?? undefined}
                            alt={c.instructor.name}
                            initials={initialsOf(c.instructor.name)}
                          />
                          <span className="truncate text-t-14 text-fg-2">
                            {c.instructor.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-sp-4 py-sp-3 text-right text-t-14 font-semibold text-ilm-ink">
                        {formatCompactCount(c.studentsCount)}
                      </td>
                      <td className="px-sp-4 py-sp-3 text-right">
                        <span className="inline-flex items-center gap-1 text-t-14 text-fg-2">
                          <Star className="h-3.5 w-3.5 fill-current text-ilm-ink" />
                          {c.ratingAvg ? c.ratingAvg.toFixed(2) : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card padding="lg" className="flex flex-col gap-sp-3">
          <h3 className="text-t-18 font-bold text-ilm-ink">Top kategoriyalar</h3>
          {topCategories.data ? (
            <CategoriesChart data={topCategories.data} />
          ) : (
            <PageLoader />
          )}
        </Card>
      </div>

      <div className="grid gap-sp-4 lg:grid-cols-2">
        <Card padding="lg" className="flex flex-col gap-sp-4">
          <div className="flex items-center justify-between">
            <h3 className="text-t-18 font-bold text-ilm-ink">
              Moderatsiyadagi kurslar
            </h3>
            <Button asChild size="sm" variant="secondary" iconRight={ArrowRight}>
              <Link href="/admin/courses">Hammasi</Link>
            </Button>
          </div>
          {pendingCourses.length === 0 ? (
            <EmptyState icon={FileCheck2} text="Kutilayotgan kurslar yo'q" />
          ) : (
            <ul className="flex flex-col gap-sp-3">
              {pendingCourses.map((c) => (
                <li key={c.id} className="flex items-center gap-sp-3">
                  <Avatar
                    size="sm"
                    ink
                    src={c.instructor.avatarUrl ?? undefined}
                    alt={c.instructor.name}
                    initials={initialsOf(c.instructor.name)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-t-14 font-semibold text-ilm-ink">
                      {c.title}
                    </p>
                    <p className="truncate text-t-12 text-fg-3">
                      {c.instructor.name} · {formatShortDate(c.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card padding="lg" className="flex flex-col gap-sp-4">
          <div className="flex items-center justify-between">
            <h3 className="text-t-18 font-bold text-ilm-ink">
              Ustozlik arizalari
            </h3>
            <Button asChild size="sm" variant="secondary" iconRight={ArrowRight}>
              <Link href="/admin/instructors">Hammasi</Link>
            </Button>
          </div>
          {pendingApplications.length === 0 ? (
            <EmptyState icon={GraduationCap} text="Kutilayotgan arizalar yo'q" />
          ) : (
            <ul className="flex flex-col gap-sp-3">
              {pendingApplications.map((a) => (
                <li key={a.id} className="flex items-center gap-sp-3">
                  <Avatar
                    size="sm"
                    ink
                    src={a.applicant.avatarUrl ?? undefined}
                    alt={a.applicant.name}
                    initials={initialsOf(a.applicant.name)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-t-14 font-semibold text-ilm-ink">
                      {a.applicant.name}
                    </p>
                    <p className="truncate text-t-12 text-fg-3">
                      {a.expertise} · {formatShortDate(a.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
