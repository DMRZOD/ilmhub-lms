"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AxiosError } from "axios";
import {
  AtSign,
  Award,
  BookCheck,
  Calendar,
  Code2,
  Globe,
  Medal,
  ScrollText,
  Send,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CourseCard } from "@/components/features/courses/course-card";
import { Mascot } from "@/components/features/home/mascot";
import { ROLE_LABELS } from "@/features/auth/labels";
import { usePublicProfile } from "@/features/profile/hooks";
import type {
  ProfileAchievement,
  ProfileCertificate,
  PublicProfile,
} from "@/features/profile/types";

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  Award,
  Medal,
  Sparkles,
  Trophy,
};

function pickAchievementIcon(name: string | null): LucideIcon {
  if (!name) return Trophy;
  return ACHIEVEMENT_ICONS[name] ?? Trophy;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type SocialLink = { href: string; label: string; icon: LucideIcon };

function buildSocials(p: PublicProfile): SocialLink[] {
  const out: SocialLink[] = [];
  if (p.website) out.push({ href: p.website, label: "Veb-sayt", icon: Globe });
  if (p.telegram)
    out.push({
      href: `https://t.me/${p.telegram.replace(/^@/, "")}`,
      label: "Telegram",
      icon: Send,
    });
  if (p.github)
    out.push({
      href: `https://github.com/${p.github.replace(/^@/, "")}`,
      label: "GitHub",
      icon: Code2,
    });
  if (p.twitter)
    out.push({
      href: `https://x.com/${p.twitter.replace(/^@/, "")}`,
      label: "Twitter",
      icon: AtSign,
    });
  return out;
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
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

function ProfileHero({ profile }: { profile: PublicProfile }) {
  const socials = buildSocials(profile);
  return (
    <section className="border-b border-ilm-border bg-ilm-surface-2">
      <div className="mx-auto flex max-w-7xl flex-col gap-sp-8 px-sp-4 py-sp-10 sm:px-sp-6 lg:py-sp-14">
        <div className="grid gap-sp-8 md:grid-cols-[auto_1fr] md:items-start">
          <Avatar
            size="lg"
            src={profile.avatarUrl ?? undefined}
            alt={profile.name}
            initials={initials(profile.name)}
            className="h-32 w-32 text-t-32 md:h-40 md:w-40"
          />

          <div className="flex flex-col gap-sp-4">
            <div className="flex flex-col gap-sp-2">
              <div className="flex flex-wrap items-center gap-sp-3">
                <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink sm:text-t-48">
                  {profile.name}
                </h1>
                <Badge tone="neutral">{ROLE_LABELS[profile.role]}</Badge>
              </div>
              {profile.bio && (
                <p className="max-w-2xl text-t-14 text-fg-2">{profile.bio}</p>
              )}
              <p className="flex items-center gap-sp-2 text-t-12 text-fg-3">
                <Icon icon={Calendar} size={14} />
                {formatDate(profile.createdAt)} dan beri a&apos;zo
              </p>
            </div>

            {socials.length > 0 && (
              <div className="flex flex-wrap gap-sp-2">
                {socials.map((s) => (
                  <Button key={s.label} variant="secondary" size="sm" asChild>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon icon={s.icon} size={14} />
                      {s.label}
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-sp-3 sm:grid-cols-3">
          <StatTile
            icon={BookCheck}
            label="Tugatgan kurslar"
            value={profile.stats.completedCount}
          />
          <StatTile
            icon={ScrollText}
            label="Sertifikatlar"
            value={profile.stats.certificatesCount}
          />
          <StatTile
            icon={Trophy}
            label="Yutuqlar"
            value={profile.stats.achievementsCount}
          />
        </div>
      </div>
    </section>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
      <div className="grid place-items-center rounded-ilm-2xl bg-ilm-ink p-sp-5">
        <Mascot variant={3} size={160} className="opacity-90" />
      </div>
      <h3 className="text-t-24 font-bold text-ilm-ink">{title}</h3>
      <p className="max-w-md text-t-14 text-fg-2">{hint}</p>
    </div>
  );
}

function CertificateCard({ cert }: { cert: ProfileCertificate }) {
  return (
    <Link
      href={`/sertifikat/${cert.certificateNumber}`}
      className="group flex flex-col overflow-hidden rounded-ilm-lg border border-ilm-border bg-ilm-surface transition-shadow duration-base ease-ilm-out hover:shadow-ilm-md"
    >
      <div className="relative aspect-video w-full bg-ilm-surface-2">
        {cert.course.thumbnailUrl && (
          <Image
            src={cert.course.thumbnailUrl}
            alt={cert.course.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        )}
        <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-ilm-full bg-ilm-ink/80 text-white">
          <Icon icon={ScrollText} size={16} />
        </span>
      </div>
      <div className="flex flex-col gap-1 p-sp-4">
        <h3 className="line-clamp-2 text-t-14 font-bold text-ilm-ink group-hover:underline">
          {cert.course.title}
        </h3>
        <p className="text-t-12 text-fg-3">
          {formatDate(cert.issuedAt)} · {cert.certificateNumber}
        </p>
      </div>
    </Link>
  );
}

function AchievementCard({ entry }: { entry: ProfileAchievement }) {
  const AchIcon = pickAchievementIcon(entry.achievement.iconName);
  return (
    <Card padding="md" hoverable className="flex items-start gap-sp-3">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-ilm-full bg-ilm-warning-bg text-ilm-warning">
        <AchIcon className="h-6 w-6" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-t-14 font-bold text-ilm-ink">
          {entry.achievement.title}
        </p>
        <p className="line-clamp-2 text-t-12 text-fg-2">
          {entry.achievement.description}
        </p>
        <p className="text-t-12 text-fg-3">{formatDate(entry.earnedAt)}</p>
      </div>
    </Card>
  );
}

export function PublicProfileView({ id }: { id: string }) {
  const { data: profile, isPending, isError, error, refetch } =
    usePublicProfile(id);

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-sp-6 px-sp-4 py-sp-10 sm:px-sp-6">
        <Skeleton className="h-48 w-full rounded-ilm-lg" />
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-sp-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-ilm-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      notFound();
    }
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-sp-4 px-sp-4 py-sp-16 text-center">
        <h2 className="text-t-24 font-bold text-ilm-ink">
          Profilni yuklab bo&apos;lmadi
        </h2>
        <Button variant="primary" size="md" onClick={() => refetch()}>
          Qayta yuklash
        </Button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      <ProfileHero profile={profile} />

      <div className="mx-auto flex max-w-7xl flex-col gap-sp-6 px-sp-4 py-sp-8 sm:px-sp-6 lg:py-sp-12">
        <Tabs defaultValue="kurslar">
          <TabsList>
            <TabsTrigger value="kurslar">Tugatgan kurslar</TabsTrigger>
            <TabsTrigger value="sertifikatlar">Sertifikatlar</TabsTrigger>
            <TabsTrigger value="yutuqlar">Yutuqlar</TabsTrigger>
          </TabsList>

          <TabsContent value="kurslar">
            {profile.completedCourses.length === 0 ? (
              <EmptyState
                title="Hozircha tugatilgan kurs yo'q"
                hint="Kursni 100% tugatgach, u shu yerda ko'rinadi."
              />
            ) : (
              <div className="grid gap-sp-5 sm:grid-cols-2 lg:grid-cols-3">
                {profile.completedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} view="grid" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sertifikatlar">
            {profile.certificates.length === 0 ? (
              <EmptyState
                title="Hozircha sertifikat yo'q"
                hint="Kursni tugatib, birinchi sertifikatingizni qo'lga kiriting."
              />
            ) : (
              <div className="grid gap-sp-5 sm:grid-cols-2 lg:grid-cols-3">
                {profile.certificates.map((cert) => (
                  <CertificateCard key={cert.id} cert={cert} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="yutuqlar">
            {profile.achievements.length === 0 ? (
              <EmptyState
                title="Hali yutuq yo'q"
                hint="Faollik ko'rsating va birinchi yutug'ingizni oching."
              />
            ) : (
              <div className="grid gap-sp-4 sm:grid-cols-2 lg:grid-cols-3">
                {profile.achievements.map((entry) => (
                  <AchievementCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
