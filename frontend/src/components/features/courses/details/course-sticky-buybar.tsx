"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPriceUsd, isFreePrice } from "@/lib/format";

export function CourseStickyBuyBar({ priceUsdCents }: { priceUsdCents: number }) {
  const isFree = isFreePrice(priceUsdCents);
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ilm-border bg-ilm-paper/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-sp-3 px-sp-4 py-sp-3">
        <div
          className={cn(
            "text-t-24 font-extrabold leading-none",
            isFree ? "text-ilm-success" : "text-ilm-ink"
          )}
        >
          {formatPriceUsd(priceUsdCents)}
        </div>
        <Button variant="primary" size="md">
          {isFree ? "Bepul boshlash" : "Sotib olish"}
        </Button>
      </div>
    </div>
  );
}
