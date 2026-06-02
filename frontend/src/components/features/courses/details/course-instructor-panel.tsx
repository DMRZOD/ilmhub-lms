import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface InstructorPanelInput {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

export function CourseInstructorPanel({
  instructor,
}: {
  instructor: InstructorPanelInput;
}) {
  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-4 sm:flex-row sm:items-start sm:gap-sp-6">
        <Avatar
          size="lg"
          src={instructor.avatarUrl ?? undefined}
          alt={instructor.name}
        />
        <div className="flex flex-col gap-sp-2">
          <h3 className="text-t-24 font-bold leading-tight text-ilm-ink">
            {instructor.name}
          </h3>
        </div>
      </div>

      {instructor.bio && (
        <p className="whitespace-pre-line text-t-14 leading-relaxed text-fg-2 md:text-t-16">
          {instructor.bio}
        </p>
      )}

      <Button
        variant="secondary"
        size="md"
        iconRight={ArrowRight}
        className="self-start"
        asChild
      >
        <Link href={`/instructors/${instructor.id}`}>Ustoz profili</Link>
      </Button>
    </div>
  );
}
