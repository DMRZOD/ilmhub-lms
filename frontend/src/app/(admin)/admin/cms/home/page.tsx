import type { Metadata } from "next";

import { CmsNav } from "../cms-nav";
import { HomeContent } from "./home-content";

export const metadata: Metadata = {
  title: "CMS · Bosh sahifa",
};

export default function CmsHomePage() {
  return (
    <div className="flex flex-col gap-sp-6">
      <CmsNav />
      <HomeContent />
    </div>
  );
}
