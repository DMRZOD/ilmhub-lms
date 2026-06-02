"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Mascot } from "@/components/features/home/mascot";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-sp-6 bg-ilm-paper px-sp-4 py-sp-12">
      <div className="grid place-items-center rounded-ilm-2xl bg-ilm-ink p-sp-6">
        <Mascot variant={3} size={180} />
      </div>
      <span className="text-t-14 font-semibold uppercase tracking-ilm-wide text-ilm-muted-2">
        Xatolik yuz berdi
      </span>
      <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink md:text-t-48">
        Nimadir noto&apos;g&apos;ri ketdi
      </h1>
      <p className="max-w-md text-center text-t-16 leading-relaxed text-fg-2">
        Kutilmagan xatolik tufayli sahifani ko&apos;rsata olmadik. Iltimos, qaytadan
        urinib ko&apos;ring yoki bosh sahifaga qayting.
      </p>
      {error.digest && (
        <p className="text-t-12 font-medium text-ilm-muted-2">
          Xato kodi: {error.digest}
        </p>
      )}
      <div className="flex flex-col gap-sp-3 sm:flex-row">
        <Button variant="primary" size="lg" onClick={reset}>
          <Icon icon={RefreshCw} size={20} />
          Qayta urinish
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/">
            <Icon icon={Home} size={20} />
            Bosh sahifa
          </Link>
        </Button>
      </div>
    </div>
  );
}
