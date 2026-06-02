"use client";

import dynamic from "next/dynamic";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import { useDashboard } from "@/features/student/hooks";

import { AchievementsStrip } from "@/components/student-shell/dashboard-cards/achievements-strip";
import { ContinueCard } from "@/components/student-shell/dashboard-cards/continue-card";
import { DashboardSkeleton } from "@/components/student-shell/dashboard-cards/dashboard-skeleton";
import { InProgressGrid } from "@/components/student-shell/dashboard-cards/in-progress-grid";
import {
  sectionContainerVariants,
  sectionItemVariants,
} from "@/components/student-shell/dashboard-cards/motion";
import { PremiumUpsell } from "@/components/student-shell/dashboard-cards/premium-upsell";
import { RecommendedCourses } from "@/components/student-shell/dashboard-cards/recommended-courses";
import { WelcomeCard } from "@/components/student-shell/dashboard-cards/welcome-card";

// recharts is heavy; defer it to a client-only lazy chunk.
const WeeklyChart = dynamic(
  () =>
    import("@/components/student-shell/dashboard-cards/weekly-chart").then(
      (m) => m.WeeklyChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-ilm-xl bg-ilm-surface" />
    ),
  },
);

function SectionHeader({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-sp-4">
      <h2 className="text-t-24 font-extrabold tracking-ilm-tight text-ilm-ink">
        {title}
      </h2>
      {hint && <span className="text-t-12 text-fg-3">{hint}</span>}
    </div>
  );
}

export function DashboardContent() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (error || !data) {
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

  return (
    <motion.div
      variants={sectionContainerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-sp-7"
    >
      <motion.section variants={sectionItemVariants}>
        <WelcomeCard
          name={data.user.name}
          streakDays={data.streakDays}
          todayMinutes={data.todayMinutes}
        />
      </motion.section>

      {data.currentLesson && (
        <motion.section variants={sectionItemVariants}>
          <ContinueCard lesson={data.currentLesson} />
        </motion.section>
      )}

      <motion.section
        variants={sectionItemVariants}
        className="flex flex-col gap-sp-4"
      >
        <SectionHeader
          title="Jarayondagi kurslar"
          hint={
            data.inProgressCourses.length
              ? `${data.inProgressCourses.length} ta kurs`
              : undefined
          }
        />
        <InProgressGrid courses={data.inProgressCourses} />
      </motion.section>

      <motion.section variants={sectionItemVariants}>
        <WeeklyChart data={data.weeklyHours} />
      </motion.section>

      <motion.section
        variants={sectionItemVariants}
        className="flex flex-col gap-sp-4"
      >
        <SectionHeader title="Yutuqlar" hint="So'nggi 3 ta" />
        <AchievementsStrip achievements={data.recentAchievements} />
      </motion.section>

      {data.recommendedCourses.length > 0 && (
        <motion.section
          variants={sectionItemVariants}
          className="flex flex-col gap-sp-4"
        >
          <SectionHeader title="Tavsiya etiladi" />
          <RecommendedCourses courses={data.recommendedCourses} />
        </motion.section>
      )}

      <motion.section variants={sectionItemVariants}>
        <PremiumUpsell />
      </motion.section>
    </motion.div>
  );
}
