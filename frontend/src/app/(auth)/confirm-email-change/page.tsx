"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { confirmEmailChange } from "@/features/users/api";

type Status = "verifying" | "success" | "error";

function VerifyingState() {
  return (
    <div className="flex flex-col items-start gap-sp-5">
      <span className="grid h-14 w-14 place-content-center rounded-ilm-full bg-ilm-surface text-ilm-ink">
        <Loader2 className="h-7 w-7 animate-spin" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Tekshirilmoqda…
        </h1>
        <p className="text-t-14 text-fg-2">
          Email manzilingiz almashtirilmoqda, biroz kuting.
        </p>
      </div>
    </div>
  );
}

function EmailAlmashtirishTasdiqInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    if (!token) {
      setStatus("error");
      setErrorMessage("Tasdiqlash havolasi topilmadi");
      return;
    }

    let cancelled = false;
    confirmEmailChange(token)
      .then(() => {
        if (cancelled) return;
        setStatus("success");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Email almashtirishda xato",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "verifying") return <VerifyingState />;

  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-sp-5">
        <span className="grid h-14 w-14 place-content-center rounded-ilm-full bg-ilm-success-bg text-ilm-success">
          <Icon icon={CheckCircle2} size={28} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            Email almashtirildi
          </h1>
          <p className="text-t-14 text-fg-2">
            Yangi email manzilingiz tasdiqlandi. Xavfsizlik uchun qayta kiring.
          </p>
        </div>
        <Button asChild size="lg" className="w-full" iconRight={ArrowRight}>
          <Link href="/login">Kirishga o&apos;tish</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-sp-5">
      <span className="grid h-14 w-14 place-content-center rounded-ilm-full bg-ilm-error-bg text-ilm-error">
        <Icon icon={AlertCircle} size={28} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Email almashtirishda xato
        </h1>
        <p className="text-t-14 text-fg-2">{errorMessage}</p>
      </div>
      <Button asChild size="lg" className="w-full">
        <Link href="/settings">Sozlamalarga qaytish</Link>
      </Button>
    </div>
  );
}

export default function EmailAlmashtirishTasdiqPage() {
  return (
    <Suspense fallback={<VerifyingState />}>
      <EmailAlmashtirishTasdiqInner />
    </Suspense>
  );
}
