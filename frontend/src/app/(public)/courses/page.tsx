import { Suspense } from "react";
import type { Metadata } from "next";

import { CourseCatalog } from "@/components/features/courses/course-catalog";

export const metadata: Metadata = {
  title: "Kurslar",
  description:
    "IlmHub kurslar katalogi — kategoriya, daraja, narx va reyting bo'yicha filtrlash, qidiruv va saralash bilan.",
};

export default function KurslarPage() {
  return (
    <Suspense fallback={null}>
      <CourseCatalog />
    </Suspense>
  );
}
