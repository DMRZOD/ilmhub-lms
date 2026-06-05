import type { Metadata } from "next";

import { CategoriesListing } from "@/components/features/categories/categories-listing";

export const metadata: Metadata = {
  title: "Kategoriyalar",
  description:
    "IlmHub'dagi barcha kurs kategoriyalari. O'zingizga mos yo'nalishni tanlang va birinchi kursni boshlang.",
};

export default function KategoriyalarPage() {
  return <CategoriesListing />;
}
