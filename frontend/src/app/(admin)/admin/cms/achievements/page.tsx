import type { Metadata } from "next";

import { CmsNav } from "../cms-nav";
import { AchievementsContent } from "./achievements-content";

export const metadata: Metadata = {
  title: "CMS · Yutuqlar",
};

export default function CmsAchievementsPage() {
  return (
    <div className="flex flex-col gap-sp-6">
      <CmsNav />
      <AchievementsContent />
    </div>
  );
}
