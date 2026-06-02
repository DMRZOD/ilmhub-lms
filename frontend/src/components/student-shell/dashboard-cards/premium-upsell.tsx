"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/features/home/mascot";

export function PremiumUpsell() {
  return (
    <div className="relative overflow-hidden rounded-ilm-2xl bg-ilm-ink p-sp-7 text-white sm:p-sp-8">
      <div className="grid gap-sp-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex flex-col gap-sp-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-ilm-full bg-white/10 px-3 py-1 text-t-12 font-semibold uppercase tracking-ilm-wide text-white">
            <Sparkles className="h-3.5 w-3.5" />
            IlmHub Pro
          </span>
          <h3 className="text-t-24 font-extrabold tracking-ilm-tight text-white sm:text-t-32">
            Barcha kurslarga kirish
          </h3>
          <p className="max-w-md text-t-14 text-white/70">
            Pro obuna bilan barcha kurslarga cheksiz kirish, mentor yordami va
            yopiq jamoaga qo&apos;shilish imkoniyatiga ega bo&apos;ling.
          </p>
          <Button
            asChild
            variant="primary"
            className="mt-sp-2 w-fit bg-white text-ilm-ink hover:bg-white/90"
          >
            <Link href="/pro">Sotib olish</Link>
          </Button>
        </div>
        <div className="hidden justify-end sm:flex">
          <Mascot variant={2} size={120} />
        </div>
      </div>
    </div>
  );
}
