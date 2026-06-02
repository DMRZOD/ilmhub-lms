"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BadgeCheck,
  Copy,
  Download,
  UserPlus,
  Link as LinkIcon,
  Send,
  Share2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

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
import { certificatePublicDownloadUrl } from "@/features/certificates/api";
import { useCertificateVerify } from "@/features/certificates/hooks";
import {
  linkedInAddToProfileUrl,
  linkedInShareUrl,
  telegramShareUrl,
} from "@/features/certificates/share";
import type { ValidCertificate } from "@/features/certificates/types";

const dateFmt = new Intl.DateTimeFormat("uz-UZ", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function CertificateVerifyContent({ number }: { number: string }) {
  const query = useCertificateVerify(number);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-sp-6 px-sp-4 py-sp-12 sm:px-sp-6">
      <header className="flex flex-col gap-sp-2 text-center">
        <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
          Sertifikatni tekshirish
        </span>
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          IlmHub sertifikati
        </h1>
        <p className="text-t-14 text-fg-2">Raqam: {number}</p>
      </header>

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <InvalidState
          title="Tekshirib bo'lmadi"
          body="Sertifikatni tekshirishda xatolik yuz berdi. Keyinroq qayta urinib ko'ring."
        />
      ) : !query.data.valid ? (
        <InvalidState
          title="Sertifikat topilmadi"
          body="Bu raqam bo'yicha haqiqiy sertifikat mavjud emas. Havolani tekshirib qayta urinib ko'ring."
        />
      ) : (
        <ValidCertificateView data={query.data} number={number} />
      )}
    </div>
  );
}

function ValidCertificateView({
  data,
  number,
}: {
  data: ValidCertificate;
  number: string;
}) {
  const issuedLabel = `Berildi: ${dateFmt.format(new Date(data.issuedAt))}`;
  const downloadUrl = certificatePublicDownloadUrl(number);

  const shareUrl = useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/sertifikat/${number}`
        : `/sertifikat/${number}`,
    [number],
  );
  const shareText = `IlmHub sertifikati: ${data.courseTitle}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Havola nusxalandi");
    } catch {
      toast.error("Nusxalab bo'lmadi");
    }
  };

  const openLinkedIn = () =>
    window.open(linkedInShareUrl(shareUrl), "_blank", "noopener,noreferrer");
  const openTelegram = () =>
    window.open(
      telegramShareUrl(shareUrl, shareText),
      "_blank",
      "noopener,noreferrer",
    );
  const openLinkedInAdd = () =>
    window.open(
      linkedInAddToProfileUrl({
        courseTitle: data.courseTitle,
        certificateNumber: data.certificateNumber,
        verifyUrl: shareUrl,
        issuedAt: data.issuedAt,
      }),
      "_blank",
      "noopener,noreferrer",
    );

  return (
    <div className="flex flex-col gap-sp-4">
      <div className="flex justify-center">
        <Badge tone="success" icon={BadgeCheck}>
          Tasdiqlangan haqiqiy sertifikat
        </Badge>
      </div>

      <div
        className="relative flex aspect-[1.6/1] flex-col justify-between rounded-ilm-2xl bg-ilm-paper p-sp-8 shadow-ilm-sm"
        style={{
          backgroundImage:
            "radial-gradient(circle at 0 100%, var(--ilm-surface), transparent 40%)",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-sp-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-ilm-ink text-white">
              <span className="text-[24px] font-extrabold leading-none tracking-tighter">
                i.
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-t-16 font-extrabold tracking-ilm-tight text-ilm-ink">
                IlmHub
              </span>
              <span className="text-t-12 text-fg-3">Sertifikat</span>
            </div>
          </div>
          <BadgeCheck className="h-8 w-8 text-ilm-ink" aria-hidden />
        </div>

        <div className="flex flex-col gap-sp-2">
          <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
            Quyidagi shaxsga beriladi
          </span>
          <p className="text-t-24 font-extrabold tracking-ilm-tight text-ilm-ink">
            {data.studentName}
          </p>
          <span className="text-t-12 text-fg-3">muvaffaqiyatli tugatgani uchun:</span>
          <h2 className="line-clamp-2 text-t-24 font-bold tracking-ilm-tight text-ilm-ink">
            {data.courseTitle}
          </h2>
          <p className="text-t-12 text-fg-2">{data.instructorName}</p>
        </div>

        <div className="flex items-end justify-between border-t border-dashed border-ilm-border pt-sp-3">
          <div className="flex flex-col leading-tight">
            <span className="text-t-12 text-fg-3">Berilgan sana</span>
            <span className="text-t-14 font-bold text-ilm-ink">
              {dateFmt.format(new Date(data.issuedAt))}
            </span>
          </div>
          <div className="flex flex-col leading-tight text-right">
            <span className="text-t-12 text-fg-3">ID</span>
            <span className="font-mono text-t-12 font-bold text-ilm-ink">
              {data.certificateNumber}
            </span>
          </div>
        </div>
      </div>

      <Card padding="sm" className="flex flex-wrap items-center justify-between gap-sp-3">
        <span className="text-t-12 text-fg-3">{issuedLabel}</span>
        <div className="flex items-center gap-sp-2">
          <Button variant="ghost" size="sm" asChild>
            <a href={downloadUrl}>
              <Download className="h-4 w-4" />
              Yuklab olish
            </a>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="primary" size="sm" iconLeft={Share2}>
                Ulashish
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[220px]">
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

function LoadingState() {
  return (
    <div className="flex flex-col gap-sp-4">
      <Skeleton className="mx-auto h-7 w-64 rounded-ilm-full" />
      <Skeleton className="aspect-[1.6/1] w-full rounded-ilm-2xl" />
      <Skeleton className="h-16 w-full rounded-ilm-md" />
    </div>
  );
}

function InvalidState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-sp-4 py-sp-12 text-center">
      <div className="grid place-items-center rounded-ilm-2xl bg-ilm-ink p-sp-5">
        <ShieldAlert className="h-12 w-12 text-white" aria-hidden />
      </div>
      <h2 className="text-t-24 font-bold text-ilm-ink">{title}</h2>
      <p className="max-w-md text-t-14 text-fg-2">{body}</p>
      <div className="flex items-center gap-sp-3">
        <Mascot variant={2} size={96} className="opacity-80" />
      </div>
      <Button variant="primary" size="md" asChild>
        <Link href="/courses">Kurslarni ko&apos;rish</Link>
      </Button>
    </div>
  );
}
