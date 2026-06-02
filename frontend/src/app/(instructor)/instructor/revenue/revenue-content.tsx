"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  Banknote,
  CalendarDays,
  DollarSign,
  Receipt,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  EmptyState,
  ErrorCard,
  Pager,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import { formatShortDate, formatUsd, initialsOf } from "@/lib/format";
import { useInstructorRevenue } from "@/features/instructor/hooks";

// recharts is heavy; defer the chart to a client-only lazy chunk.
const RevenueChart = dynamic(
  () => import("./revenue-chart").then((m) => m.RevenueChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-ilm-xl bg-ilm-surface" />
    ),
  },
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

export function RevenueContent() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useInstructorRevenue(page);

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorCard />;

  const { stats, chart, availableBalanceUsdCents, transactions } = data;
  const commissionPct = Math.round(stats.commissionRate * 100);

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-sp-1">
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            Daromad
          </h1>
          <p className="text-t-14 text-fg-2">
            Platforma komissiyasi: {commissionPct}% · Mavjud balans:{" "}
            {formatUsd(availableBalanceUsdCents)}
          </p>
        </div>
        <Button
          iconLeft={Wallet}
          className="self-start"
          onClick={() => toast("Pul yechish tez orada ishga tushadi")}
        >
          Pulni yechish
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-sp-4 lg:grid-cols-3">
        <StatCard
          icon={CalendarDays}
          label="Bu oy"
          value={formatUsd(stats.month.netUsdCents)}
          hint={`Yalpi: ${formatUsd(stats.month.grossUsdCents)}`}
        />
        <StatCard
          icon={DollarSign}
          label="Bu yil"
          value={formatUsd(stats.year.netUsdCents)}
          hint={`Yalpi: ${formatUsd(stats.year.grossUsdCents)}`}
        />
        <StatCard
          icon={Banknote}
          label="Butun vaqt"
          value={formatUsd(stats.allTime.netUsdCents)}
          hint={`Yalpi: ${formatUsd(stats.allTime.grossUsdCents)}`}
        />
      </div>

      <Card padding="lg" className="flex flex-col gap-sp-4">
        <div>
          <h3 className="text-t-18 font-bold text-ilm-ink">Oylik daromad</h3>
          <p className="text-t-12 text-fg-3">
            So&apos;nggi 12 oy sof daromadi (komissiyadan keyin)
          </p>
        </div>
        <RevenueChart data={chart} />
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-ilm-border px-sp-4 py-sp-4">
          <h3 className="text-t-18 font-bold text-ilm-ink">Tranzaksiyalar</h3>
        </div>
        {transactions.items.length === 0 ? (
          <EmptyState icon={Receipt} text="Hozircha sotuvlar yo'q" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ilm-border text-t-12 uppercase tracking-ilm-wide text-fg-3">
                  <th className="px-sp-4 py-sp-3 font-semibold">Kurs</th>
                  <th className="px-sp-4 py-sp-3 font-semibold">Talaba</th>
                  <th className="px-sp-4 py-sp-3 font-semibold">Sana</th>
                  <th className="px-sp-4 py-sp-3 text-right font-semibold">
                    Yalpi
                  </th>
                  <th className="px-sp-4 py-sp-3 text-right font-semibold">
                    Komissiya
                  </th>
                  <th className="px-sp-4 py-sp-3 text-right font-semibold">
                    Sof
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.items.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-ilm-border last:border-0"
                  >
                    <td className="max-w-[220px] px-sp-4 py-sp-3">
                      <p className="truncate text-t-14 font-semibold text-ilm-ink">
                        {t.course.title}
                      </p>
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <div className="flex items-center gap-sp-2">
                        <Avatar
                          size="sm"
                          ink
                          src={t.student.avatarUrl ?? undefined}
                          alt={t.student.name}
                          initials={initialsOf(t.student.name)}
                        />
                        <span className="truncate text-t-14 text-fg-2">
                          {t.student.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {t.paidAt ? formatShortDate(t.paidAt) : "—"}
                    </td>
                    <td className="px-sp-4 py-sp-3 text-right text-t-14 text-fg-2">
                      {formatUsd(t.grossUsdCents)}
                    </td>
                    <td className="px-sp-4 py-sp-3 text-right text-t-14 text-ilm-error">
                      −{formatUsd(t.feeUsdCents)}
                    </td>
                    <td className="px-sp-4 py-sp-3 text-right text-t-14 font-semibold text-ilm-ink">
                      {formatUsd(t.netUsdCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pager
        page={transactions.meta.page}
        totalPages={transactions.meta.totalPages}
        onPage={setPage}
      />
    </div>
  );
}
