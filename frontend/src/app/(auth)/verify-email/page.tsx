"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { resendVerification, verifyEmail } from "@/features/auth/api";

type Status = "verifying" | "success" | "error";

const AUTO_REDIRECT_MS = 3000;

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
          Email manzilingizni tasdiqlayapmiz, biroz kuting.
        </p>
      </div>
    </div>
  );
}

function EmailniTasdiqlashInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") ?? "";

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resending, setResending] = useState(false);
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
    verifyEmail({ token })
      .then(() => {
        if (cancelled) return;
        setStatus("success");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Email tasdiqlashda xato"
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (status !== "success") return;
    const id = setTimeout(() => router.push("/student/dashboard"), AUTO_REDIRECT_MS);
    return () => clearTimeout(id);
  }, [status, router]);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification({ email });
      toast.success("Tasdiqlash havolasi qayta yuborildi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xato yuz berdi");
    } finally {
      setResending(false);
    }
  };

  if (status === "verifying") return <VerifyingState />;

  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-sp-5">
        <span className="grid h-14 w-14 place-content-center rounded-ilm-full bg-ilm-success-bg text-ilm-success">
          <Icon icon={CheckCircle2} size={28} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            Email tasdiqlandi
          </h1>
          <p className="text-t-14 text-fg-2">
            Akkauntingiz faollashtirildi. Bir necha soniyada dashboard ochiladi.
          </p>
        </div>
        <Button asChild size="lg" className="w-full" iconRight={ArrowRight}>
          <Link href="/student/dashboard">Dashboardga o&apos;tish</Link>
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
          Email tasdiqlashda xato
        </h1>
        <p className="text-t-14 text-fg-2">{errorMessage}</p>
      </div>
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={handleResend}
        disabled={resending || !email}
        iconLeft={resending ? undefined : RefreshCw}
      >
        {resending && <Loader2 className="h-4 w-4 animate-spin" />}
        Havolani qayta yuborish
      </Button>
      {!email && (
        <p className="text-t-12 text-fg-3">
          Qayta yuborish uchun email manzili kerak. Iltimos,{" "}
          <Link href="/login" className="font-semibold text-ilm-ink underline-offset-4 hover:underline">
            kirish
          </Link>{" "}
          sahifasiga o&apos;ting.
        </p>
      )}
    </div>
  );
}

export default function EmailniTasdiqlashPage() {
  return (
    <Suspense fallback={<VerifyingState />}>
      <EmailniTasdiqlashInner />
    </Suspense>
  );
}
