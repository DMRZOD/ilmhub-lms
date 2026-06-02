"use client";

import { InstructorCard } from "@/components/features/instructors/instructor-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructors } from "@/features/instructors/hooks";

import { MotionSection } from "./motion-section";
import { SectionHeading } from "./section-heading";

export function InstructorsSection() {
  const { data, isPending, isError } = useInstructors({
    page: 1,
    limit: 4,
    sort: "popular",
  });

  return (
    <MotionSection>
      <SectionHeading
        title="Eng yaxshi ustozlar"
        subtitle="Soha mutaxassislaridan to'g'ridan-to'g'ri o'rganing."
        linkHref="/instructors"
        linkLabel="Barchasini ko'rish"
      />
      <div className="mt-sp-10 grid gap-sp-6 sm:grid-cols-2 lg:grid-cols-4">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-ilm-lg" />
          ))
        ) : isError ? (
          <p className="col-span-full text-center text-t-14 text-fg-2">
            Ustozlarni yuklab bo&apos;lmadi.
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
