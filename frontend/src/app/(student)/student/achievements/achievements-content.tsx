"use client";

import {
  BrainCog,
  CheckCheck,
  Flame,
  Footprints,
  GraduationCap,
  Lock,
  Medal,
  Star,
  Sunrise,
  Terminal,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAchievements } from "@/features/student/hooks";
import type {
  AchievementCategory,
  StudentAchievement,
} from "@/features/student/types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Footprints,
  CheckCircle2: CheckCheck,
  CheckCheck,
  Star,
  GraduationCap,
  Flame,
  Trophy,
  BrainCog,
  Terminal,
  Sunrise,
  Users,
  Medal,
};

const CATEGORY_ORDER: AchievementCategory[] = [
  "BOSHLANISH",
  "DAVOMIY",
  "TUGATISH",
  "SOTSIAL",
];

const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  BOSHLANISH: "Boshlanish",
  DAVOMIY: "Davomiy",
  TUGATISH: "Tugatish",
  SOTSIAL: "Sotsial",
};

const dateFmt = new Intl.DateTimeFormat("uz-UZ", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function YutuqlarContent() {
  const query = useAchievements();
  const data = query.data;
  const earned = data?.earnedCount ?? 0;
  const total = data?.totalCount ?? 0;
  const progressValue = total === 0 ? 0 : (earned / total) * 100;

  return (
    <div className="flex flex-col gap-sp-6">
      <header className="flex flex-col gap-sp-3">
        <div className="flex flex-col gap-sp-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-sp-2">
            <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
              Gamifikatsiya
            </span>
            <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
              Yutuqlar
            </h1>
            <p className="text-t-14 text-fg-2">
              Yangi cho&apos;qqilarni zabt etganingiz uchun mukofotlar.
            </p>
          </div>
          <Badge tone="success" icon={Medal}>
            {earned} / {total} yutuq
          </Badge>
        </div>
        <Progress
          value={progressValue}
          label={`${earned} of ${total} achievements earned`}
        />
      </header>

      {query.isPending ? (
        <SkeletonGrid />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : data && data.items.length > 0 ? (
        <div className="flex flex-col gap-sp-7">
          {CATEGORY_ORDER.map((category) => {
            const items = data.items.filter(
              (a) => a.category === category,
            );
            if (items.length === 0) return null;
            return (
              <section key={category} className="flex flex-col gap-sp-4">
                <h2 className="text-t-18 font-bold text-ilm-ink">
                  {CATEGORY_LABEL[category]}
                </h2>
                <div className="grid gap-sp-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((a) => (
                    <AchievementCard key={a.id} achievement={a} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <p className="text-t-14 text-fg-2">Hozircha yutuq yo&apos;q.</p>
      )}
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: StudentAchievement }) {
  const IconCmp = (achievement.iconName && ICON_MAP[achievement.iconName]) || Medal;
  const earnedLabel = achievement.earnedAt
    ? `Olindi: ${dateFmt.format(new Date(achievement.earnedAt))}`
    : null;

  return (
    <Card
      padding="md"
      className={cn(
        "flex flex-col items-center gap-sp-3 text-center transition-opacity",
        !achievement.earned && "opacity-70",
      )}
    >
      <div
        className={cn(
          "relative flex h-16 w-16 items-center justify-center rounded-ilm-full",
          achievement.earned
            ? "bg-ilm-ink text-white"
            : "bg-ilm-surface text-fg-3",
        )}
      >
        <Icon icon={IconCmp} size={28} />
        {!achievement.earned && (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-ilm-full bg-ilm-paper text-fg-2 ring-1 ring-ilm-border">
            <Lock className="h-3 w-3" aria-hidden />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-t-16 font-semibold text-ilm-ink">
          {achievement.title}
        </h3>
        <p className="text-t-12 text-fg-2">{achievement.description}</p>
      </div>
      {earnedLabel && (
        <span className="text-t-12 text-fg-3">{earnedLabel}</span>
      )}
    </Card>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-sp-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} padding="md" className="flex flex-col items-center gap-sp-3">
          <Skeleton className="h-16 w-16 rounded-ilm-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </Card>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-sp-4 py-sp-12 text-center">
      <h3 className="text-t-24 font-bold text-ilm-ink">Yuklab bo&apos;lmadi</h3>
      <Button variant="primary" size="md" onClick={onRetry}>
        Qayta yuklash
      </Button>
    </div>
  );
}
