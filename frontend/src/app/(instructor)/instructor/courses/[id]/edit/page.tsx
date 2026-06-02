"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";

import { CourseWizard } from "@/components/features/course-wizard/course-wizard";

export default function CourseWizardPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  if (!id) return null;
  return (
    <Suspense fallback={null}>
      <CourseWizard courseId={id} />
    </Suspense>
  );
}
