"use client";

import { InstructorCard } from "@/components/features/instructors/instructor-card";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionSection } from "@/components/features/home/motion-section";
import { SectionHeading } from "@/components/features/home/section-heading";
import { useInstructors } from "@/features/instructors/hooks";

export function TeamSection() {
  const { data, isPending, isError } = useInstructors({
    page: 1,
    limit: 6,
    sort: "popular",
  });

  return (
    <MotionSection>
      <SectionHeading
        title="Bizning jamoamiz"
        subtitle="IlmHub ortida turgan ustozlar va mutaxassislar bilan tanishing."
        align="center"
      />
      <div className="mt-sp-10 grid gap-sp-6 sm:grid-cols-2 lg:grid-cols-3">
        {isPending ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-ilm-lg" />
          ))
        ) : isError ? (
          <p className="col-span-full text-center text-t-14 text-fg-2">
            Jamoa ma&apos;lumotini yuklab bo&apos;lmadi.
          </p>
        ) : (
          (data?.items ?? []).map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))
        )}
      </div>
    </MotionSection>
  );
}
