import {
  GraduationCap,
  MessageCircle,
  MessageSquare,
  Star,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { formatCompactCount } from "@/lib/format";
import type { InstructorDetail } from "@/types/api";

function StatTile({
  icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Card padding="md" variant="surface" className="flex flex-col gap-sp-1">
      <div className="flex items-center gap-sp-2 text-fg-2">
        <Icon icon={icon} size={16} />
        <span className="text-t-12 font-semibold uppercase tracking-ilm-wide">
          {label}
        </span>
      </div>
      <div className="text-t-24 font-extrabold text-ilm-ink">{value}</div>
    </Card>
  );
}

export function InstructorHero({ instructor }: { instructor: InstructorDetail }) {
  return (
    <section className="border-b border-ilm-border bg-ilm-surface-2">
      <div className="mx-auto flex max-w-7xl flex-col gap-sp-8 px-sp-4 py-sp-10 sm:px-sp-6 lg:py-sp-14">
        <div className="grid gap-sp-8 md:grid-cols-[auto_1fr] md:items-start">
          <Avatar
            size="lg"
            src={instructor.avatarUrl ?? undefined}
            alt={instructor.name}
            className="h-32 w-32 text-t-32 md:h-40 md:w-40"
          />

          <div className="flex flex-col gap-sp-4">
            <div className="flex flex-col gap-sp-2">
              <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink sm:text-t-48">
                {instructor.name}
              </h1>
              {instructor.bio && (
                <p className="max-w-2xl text-t-14 text-fg-2">{instructor.bio}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-sp-3">
              <Button variant="primary" size="md" iconLeft={UserPlus}>
                Kuzatish
              </Button>
              <Button variant="secondary" size="md" iconLeft={MessageCircle}>
                Xabar yozish
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-sp-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={Users}
            label="Talabalar"
            value={formatCompactCount(instructor.stats.studentsCount)}
          />
          <StatTile
            icon={GraduationCap}
            label="Kurslar"
            value={String(instructor.stats.coursesCount)}
          />
          <StatTile
            icon={Star}
            label="Reyting"
            value={instructor.stats.ratingAvg.toFixed(1)}
          />
          <StatTile
            icon={MessageSquare}
            label="Sharhlar"
            value={formatCompactCount(instructor.stats.reviewsCount)}
          />
        </div>
      </div>
    </section>
  );
}
