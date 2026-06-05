import { Suspense } from "react";
import type { Metadata } from "next";

import { InstructorsCatalog } from "@/components/features/instructors/instructors-catalog";

export const metadata: Metadata = {
  title: "Ustozlar",
  description:
    "IlmHub ustozlari — soha mutaxassislari, ularning kurslari, reytingi va talabalar soni. Qidiruv va saralash bilan.",
};

export default function UstozlarPage() {
  return (
    <Suspense fallback={null}>
      <InstructorsCatalog />
    </Suspense>
  );
}
