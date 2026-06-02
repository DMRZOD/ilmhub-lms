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

import { Card } from "@/components/ui/card";
import type { WeeklyHoursPoint } from "@/features/student/types";

const DAY_LABELS = ["Yak", "Du", "Se", "Cho", "Pa", "Ju", "Sh"];

function dayLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return DAY_LABELS[d.getDay()] ?? "";
}

export function WeeklyChart({ data }: { data: WeeklyHoursPoint[] }) {
  const chartData = data.map((p) => ({
    label: dayLabel(p.date),
    hours: p.hours,
    date: p.date,
  }));
  const total = data.reduce((s, p) => s + p.hours, 0);

  return (
    <Card padding="lg">
      <div className="mb-sp-4 flex items-baseline justify-between">
        <div>
          <h3 className="text-t-18 font-bold text-ilm-ink">Haftalik o&apos;qish</h3>
          <p className="text-t-12 text-fg-3">So&apos;nggi 7 kun</p>
        </div>
        <div className="text-right">
          <div className="text-t-24 font-extrabold text-ilm-ink">
            {total.toFixed(1)}
          </div>
          <div className="text-t-12 text-fg-3">soat</div>
        </div>
      </div>
      <div className="h-48 w-full">
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
              tick={{ fontSize: 12, fill: "#9ca3af" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              width={32}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
              formatter={(value) => [`${value} soat`, "O'qish"]}
              labelFormatter={(label) => String(label)}
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#0a0a0a"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#0a0a0a" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
