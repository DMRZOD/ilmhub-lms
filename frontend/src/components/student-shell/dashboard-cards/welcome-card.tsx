"use client";

import { Flame, Timer } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Mascot } from "@/components/features/home/mascot";

function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

export function WelcomeCard({
  name,
  streakDays,
  todayMinutes,
}: {
  name: string;
  streakDays: number;
  todayMinutes: number;
}) {
  return (
    <Card
      padding="lg"
      className="flex flex-col gap-sp-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-sp-3">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Salom, {firstName(name)}
        </h1>
        <p className="text-t-14 text-fg-2">
          Bugun {todayMinutes} minut o&apos;rganildi. Davom etamizmi?
        </p>
        <div className="flex flex-wrap gap-sp-2">
          <span className="inline-flex items-center gap-1.5 rounded-ilm-full bg-ilm-warning-bg px-3 py-1 text-t-12 font-semibold text-ilm-warning">
            <Flame className="h-3.5 w-3.5" />
            {streakDays} kun ketma-ket
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-ilm-full bg-ilm-info-bg px-3 py-1 text-t-12 font-semibold text-ilm-info">
            <Timer className="h-3.5 w-3.5" />
            {todayMinutes} daq bugun
          </span>
        </div>
      </div>
      <div className="grid shrink-0 place-items-center self-start rounded-ilm-2xl bg-ilm-ink p-sp-3 sm:self-center">
        <Mascot variant={2} size={80} />
      </div>
    </Card>
  );
}
