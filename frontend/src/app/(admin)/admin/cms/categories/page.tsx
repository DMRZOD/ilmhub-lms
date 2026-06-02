import type { Metadata } from "next";

import { CmsNav } from "../cms-nav";
import { CategoriesContent } from "./categories-content";

export const metadata: Metadata = {
  title: "CMS · Kategoriyalar · IlmHub",
};

export default function CmsCategoriesPage() {
  return (
    <div className="flex flex-col gap-sp-6">
      <CmsNav />
      <CategoriesContent />
    </div>
  );
}
