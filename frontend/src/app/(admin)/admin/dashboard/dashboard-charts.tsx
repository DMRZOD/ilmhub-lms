"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Inbox } from "lucide-react";

import { EmptyState } from "@/components/instructor-shell/page-states";
import { formatShortDate } from "@/lib/format";
import type {
  AdminRevenue,
  AdminTopCategories,
  AdminUsersGrowth,
} from "@/features/admin/schemas";

const MONTH_SHORT = [
  "Yan",
  "Fev",
  "Mar",
  "Apr",
  "May",
  "Iyn",
  "Iyl",
  "Avg",
  "Sen",
  "Okt",
  "Noy",
  "Dek",
];

// Monochrome palette for pie slices (dark → light gray, no gradients).
const GRAY_SCALE = [
  "#0a0a0a",
  "#374151",
  "#6b7280",
  "#9ca3af",
  "#cbd5e1",
  "#e5e7eb",
];

function monthLabel(month: string): string {
  const [, m] = month.split("-");
  return MONTH_SHORT[Number(m) - 1] ?? month;
}

export function UsersGrowthChart({ data }: { data: AdminUsersGrowth }) {
  const chartData = data.map((p) => ({
    label: `${new Date(p.date).getUTCDate()}`,
    date: p.date,
    count: p.count,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={4}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={32}
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
          />
          <Tooltip
            cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
            formatter={(value) => [`${value} ta`, "Yangi foydalanuvchi"]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload
                ? formatShortDate(payload[0].payload.date as string)
                : ""
            }
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#0a0a0a"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueChart({ data }: { data: AdminRevenue }) {
  const chartData = data.map((p) => ({
    label: monthLabel(p.month),
    value: p.revenueUsdCents / 100,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={48}
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
          />
          <Tooltip
            cursor={{ fill: "#f5f5f5" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
            formatter={(value) => [`$${value}`, "Daromad"]}
          />
          <Bar dataKey="value" fill="#0a0a0a" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoriesChart({ data }: { data: AdminTopCategories }) {
  const top = data.slice(0, 6);
  if (top.length === 0) {
    return <EmptyState icon={Inbox} text="Hozircha ma'lumot yo'q" />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={top}
            dataKey="enrollments"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={84}
            paddingAngle={2}
            stroke="#ffffff"
            strokeWidth={2}
          >
            {top.map((entry, i) => (
              <Cell key={entry.id} fill={GRAY_SCALE[i % GRAY_SCALE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
            formatter={(value, name) => [`${value} ta`, name as string]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-t-12 text-fg-2">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
