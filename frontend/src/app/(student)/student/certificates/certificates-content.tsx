"use client";

import Link from "next/link";
import {
  Award,
  BadgeCheck,
  Copy,
  Download,
  UserPlus,
  Link as LinkIcon,
  Send,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

import { linkedInAddToProfileUrl } from "@/features/certificates/share";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Mascot } from "@/components/features/home/mascot";
import { useAuth } from "@/features/auth/hooks";
import {
  useCertificates,
  useDownloadCertificate,
} from "@/features/student/hooks";
import type { StudentCertificate } from "@/features/student/types";

const dateFmt = new Intl.DateTimeFormat("uz-UZ", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function SertifikatlarContent() {
  const query = useCertificates();
  const items = query.data?.items ?? [];

  return (
    <div className="flex flex-col gap-sp-6">
      <header className="flex flex-col gap-sp-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-sp-2">
          <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
            Sertifikatlar
          </span>
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            Mening yutuqlarim
          </h1>
          <p className="text-t-14 text-fg-2">
            Tugatilgan kurslar uchun rasmiy sertifikatlaringiz.
          </p>
        </div>
        <div className="flex items-center gap-sp-3">
          <Badge tone="success" icon={Award}>
            {items.length} ta sertifikat
          </Badge>
        </div>
      </header>

      {query.isPending ? (
        <SkeletonGrid />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-sp-6 sm:grid-cols-2">
          {items.map((cert) => (
            <CertificateCard key={cert.id} cert={cert} />
          ))}
        </div>
      )}
    </div>
  );
}

function CertificateCard({ cert }: { cert: StudentCertificate }) {
  const { data: user } = useAuth();
  const download = useDownloadCertificate();

  const studentName = user?.name ?? "—";
  const issuedLabel = `Berildi: ${dateFmt.format(new Date(cert.issuedAt))}`;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/sertifikat/${cert.certificateNumber}`
      : `/sertifikat/${cert.certificateNumber}`;
  const shareText = `IlmHub sertifikati: ${cert.course.title}`;

  const onDownload = () => {
    download.mutate(
      { id: cert.id, certificateNumber: cert.certificateNumber },
      {
        onError: () => toast.error("PDF yuklab bo'lmadi"),
      },
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Havola nusxalandi");
    } catch {
      toast.error("Nusxalab bo'lmadi");
    }
  };

  const openLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openLinkedInAdd = () => {
    const url = linkedInAddToProfileUrl({
      courseTitle: cert.course.title,
      certificateNumber: cert.certificateNumber,
      verifyUrl: shareUrl,
      issuedAt: cert.issuedAt,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col gap-sp-3">
      <div
        className="relative flex aspect-[1.6/1] flex-col justify-between rounded-ilm-2xl bg-ilm-paper p-sp-6 shadow-ilm-sm"
        style={{
          backgroundImage:
            "radial-gradient(circle at 0 100%, var(--ilm-surface), transparent 40%)",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-sp-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-ilm-ink text-white">
              <span className="text-[22px] font-extrabold leading-none tracking-tighter">
                i.
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-t-14 font-extrabold tracking-ilm-tight text-ilm-ink">
                IlmHub
              </span>
              <span className="text-t-12 text-fg-3">Sertifikat</span>
            </div>
          </div>
          <BadgeCheck className="h-7 w-7 text-ilm-ink" aria-hidden />
        </div>

        <div className="flex flex-col gap-sp-2">
          <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
            Tugatildi
          </span>
          <h2 className="line-clamp-2 text-t-24 font-bold tracking-ilm-tight text-ilm-ink">
            {cert.course.title}
          </h2>
          <p className="text-t-12 text-fg-2">
            {cert.course.instructor.name}
            {cert.course.durationMinutes
              ? ` · ${Math.round(cert.course.durationMinutes / 60)} soat`
              : ""}
          </p>
        </div>

        <div className="flex items-end justify-between border-t border-dashed border-ilm-border pt-sp-3">
          <div className="flex flex-col leading-tight">
            <span className="text-t-12 text-fg-3">Kim uchun</span>
            <span className="text-t-14 font-bold text-ilm-ink">
              {studentName}
            </span>
          </div>
          <div className="flex flex-col leading-tight text-right">
            <span className="text-t-12 text-fg-3">ID</span>
            <span className="font-mono text-t-12 font-bold text-ilm-ink">
              {cert.certificateNumber}
            </span>
          </div>
        </div>
      </div>

      <Card
        padding="sm"
        className="flex items-center justify-between gap-sp-3"
      >
        <div className="min-w-0 flex flex-col leading-tight">
          <span className="truncate text-t-14 font-bold text-ilm-ink">
            {cert.course.title}
          </span>
          <span className="text-t-12 text-fg-3">{issuedLabel}</span>
        </div>
        <div className="flex items-center gap-sp-2">
          <Button
            variant="ghost"
            size="sm"
            iconLeft={Download}
            onClick={onDownload}
            disabled={download.isPending}
          >
            Yuklab olish
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="primary" size="sm" iconLeft={Share2}>
                Ulashish
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              <DropdownMenuItem onSelect={copyLink}>
                <Copy className="h-4 w-4" />
                Havolani nusxalash
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={openLinkedIn}>
                <LinkIcon className="h-4 w-4" />
                LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={openLinkedInAdd}>
                <UserPlus className="h-4 w-4" />
                LinkedIn profilga qo&apos;shish
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={openTelegram}>
                <Send className="h-4 w-4" />
                Telegram
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-sp-6 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-sp-3">
          <Skeleton className="aspect-[1.6/1] w-full rounded-ilm-2xl" />
          <Skeleton className="h-16 w-full rounded-ilm-md" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
      <h3 className="text-t-24 font-bold text-ilm-ink">Yuklab bo&apos;lmadi</h3>
      <Button variant="primary" size="md" onClick={onRetry}>
        Qayta yuklash
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
      <div className="grid place-items-center rounded-ilm-2xl bg-ilm-ink p-sp-5">
        <Mascot variant={3} size={160} className="opacity-90" />
      </div>
      <h3 className="text-t-24 font-bold text-ilm-ink">
        Sertifikatlaringiz hali yo&apos;q
      </h3>
      <p className="max-w-md text-t-14 text-fg-2">
        Birinchi kursni to&apos;liq tugatganingizdan so&apos;ng sertifikat shu yerda paydo bo&apos;ladi.
      </p>
      <Button variant="primary" size="md" asChild>
        <Link href="/courses">Katalogga o&apos;tish</Link>
      </Button>
    </div>
  );
}
