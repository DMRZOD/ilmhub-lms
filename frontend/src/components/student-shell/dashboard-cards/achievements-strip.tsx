"use client";

import { Award, Medal, Sparkles, Trophy, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { RecentAchievement } from "@/features/student/types";

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  Medal,
  Sparkles,
  Trophy,
};

function pickIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Trophy;
  return ICON_MAP[name] ?? Trophy;
}

function formatEarned(iso: string): string {
  return new Date(iso).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
  });
}

export function AchievementsStrip({
  achievements,
}: {
  achievements: RecentAchievement[];
}) {
  if (achievements.length === 0) {
    return (
      <Card padding="lg" className="flex items-center gap-sp-3">
        <span className="grid h-10 w-10 place-items-center rounded-ilm-full bg-ilm-surface text-fg-3">
          <Trophy className="h-5 w-5" />
        </span>
        <div className="flex flex-col">
          <p className="text-t-14 font-semibold text-ilm-ink">
            Hali yutuq yo&apos;q
          </p>
          <p className="text-t-12 text-fg-3">
            Birinchi darsni tugating va yutug&apos;ingizni qo&apos;lga kiriting.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-sp-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((entry) => {
        const Icon = pickIcon(entry.achievement.iconName);
        return (
          <Card key={entry.id} padding="md" hoverable className="flex items-start gap-sp-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-ilm-full bg-ilm-warning-bg text-ilm-warning">
              <Icon className="h-6 w-6" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-t-14 font-bold text-ilm-ink">
                {entry.achievement.title}
              </p>
              <p className="line-clamp-2 text-t-12 text-fg-2">
                {entry.achievement.description}
              </p>
              <p className="text-t-12 text-fg-3">
                {formatEarned(entry.earnedAt)}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
