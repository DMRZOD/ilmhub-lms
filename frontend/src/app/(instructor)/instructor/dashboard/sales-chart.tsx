"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatShortDate } from "@/lib/format";
import type { InstructorDashboard } from "@/features/instructor/schemas";

export function SalesChart({ data }: { data: InstructorDashboard["salesChart"] }) {
  const chartData = data.map((p) => ({
    label: `${new Date(p.date).getUTCDate()}`,
    date: p.date,
    revenue: p.revenueUsdCents / 100,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            vertical={false}
          />
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
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
            formatter={(value) => [`$${value}`, "Daromad"]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload
                ? formatShortDate(payload[0].payload.date as string)
                : ""
            }
          />
          <Line
            type="monotone"
            dataKey="revenue"
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
