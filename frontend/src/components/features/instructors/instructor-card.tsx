import Link from "next/link";
import { GraduationCap, Star, Users } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCompactCount } from "@/lib/format";
import type { InstructorCard as InstructorCardType } from "@/types/api";

export function InstructorCard({
  instructor,
  className,
}: {
  instructor: InstructorCardType;
  className?: string;
}) {
  return (
    <Link
      href={`/instructors/${instructor.id}`}
      className={cn("group block", className)}
      aria-label={instructor.name}
    >
      <Card
        hoverable
        padding="lg"
        className="flex h-full flex-col items-center gap-sp-4 text-center"
      >
        <Avatar
          size="lg"
          src={instructor.avatarUrl ?? undefined}
          alt={instructor.name}
        />
        <div className="flex flex-col gap-sp-1">
          <h3 className="text-t-18 font-semibold text-ilm-ink">
            {instructor.name}
          </h3>
          {instructor.bio && (
            <p className="line-clamp-2 text-t-14 text-fg-2">
              {instructor.bio}
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-sp-2">
          <Badge icon={Star}>{instructor.stats.ratingAvg.toFixed(1)}</Badge>
          <Badge icon={Users}>
            {formatCompactCount(instructor.stats.studentsCount)}
          </Badge>
          <Badge icon={GraduationCap}>
            {instructor.stats.coursesCount} kurs
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
