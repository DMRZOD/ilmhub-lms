"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createDraftCourse } from "@/features/course-wizard/api";

export default function NewCoursePage() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    createDraftCourse()
      .then((course) =>
        router.replace(`/instructor/courses/${course.id}/edit?step=1`),
      )
      .catch(() => {
        toast.error("Kurs yaratib bo'lmadi");
        router.replace("/instructor/courses");
      });
  }, [router]);

  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-sp-3 text-fg-3">
        <Loader2 className="h-8 w-8 animate-spin text-ilm-ink" />
        <p className="text-t-14">Yangi kurs tayyorlanmoqda...</p>
      </div>
    </div>
  );
}
