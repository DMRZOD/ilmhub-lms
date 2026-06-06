"use client";

import { Loader2, Megaphone } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useCourseAnnouncements } from "@/features/announcements/hooks";
import type { CourseAnnouncement } from "@/features/announcements/types";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "hozir";
  if (m < 60) return `${m} daq oldin`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} kun oldin`;
  return new Date(iso).toLocaleDateString("uz-UZ");
}

function AnnouncementItem({ item }: { item: CourseAnnouncement }) {
  return (
    <article className="flex flex-col gap-sp-3 rounded-ilm-2xl border border-ilm-border bg-ilm-bg p-sp-5">
      <header className="flex items-center gap-sp-3">
        <Avatar
          size="sm"
          ink
          src={item.instructor.avatarUrl ?? undefined}
          alt={item.instructor.name}
          initials={initials(item.instructor.name)}
        />
        <div className="flex flex-col">
          <span className="text-t-13 font-semibold text-ilm-ink">
            {item.instructor.name}
          </span>
          <span className="text-t-12 text-fg-3">
            {formatRelative(item.createdAt)}
          </span>
        </div>
      </header>
      <h3 className="text-t-16 font-bold text-ilm-ink">{item.subject}</h3>
      <p className="whitespace-pre-line text-t-14 leading-relaxed text-fg-1">
        {item.body}
      </p>
    </article>
  );
}

interface Props {
  courseId: string;
  enrolled: boolean;
}

export function AnnouncementsPanel({ courseId, enrolled }: Props) {
  const { data, isLoading, isError } = useCourseAnnouncements(courseId, enrolled);

  if (!enrolled) {
    return (
      <div className="rounded-ilm-2xl border border-ilm-border bg-ilm-bg p-sp-5">
        <p className="text-t-14 text-fg-3">
          E&apos;lonlarni ko&apos;rish uchun kursga yozilishingiz kerak.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid place-items-center rounded-ilm-2xl border border-ilm-border bg-ilm-bg p-sp-8">
        <Loader2 className="h-6 w-6 animate-spin text-fg-3" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-ilm-2xl border border-ilm-border bg-ilm-bg p-sp-5">
        <p className="text-t-14 text-fg-3">
          E&apos;lonlarni yuklab bo&apos;lmadi.
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-sp-3 rounded-ilm-2xl border border-ilm-border bg-ilm-bg p-sp-8 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-ilm-full bg-ilm-surface text-fg-3">
          <Icon icon={Megaphone} size={20} />
        </span>
        <p className="text-t-14 font-semibold text-ilm-ink">
          Hozircha e&apos;lon yo&apos;q
        </p>
        <p className="max-w-sm text-t-12 text-fg-3">
          Ustoz e&apos;lon yuborganida u shu yerda paydo bo&apos;ladi.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sp-4">
      {data.map((item) => (
        <AnnouncementItem key={item.id} item={item} />
      ))}
    </div>
  );
}
