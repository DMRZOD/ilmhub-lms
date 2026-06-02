"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PageLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Loader2 className="h-8 w-8 animate-spin text-ilm-ink" />
    </div>
  );
}

export function ErrorCard({
  title = "Ma'lumotni yuklab bo'lmadi",
  text = "Iltimos, sahifani yangilang yoki keyinroq urinib ko'ring.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <Card padding="lg" className="flex items-center gap-sp-3">
      <span className="grid h-10 w-10 place-items-center rounded-ilm-full bg-ilm-error-bg text-ilm-error">
        <AlertCircle className="h-5 w-5" />
      </span>
      <div>
        <h3 className="text-t-16 font-bold text-ilm-ink">{title}</h3>
        <p className="text-t-14 text-fg-2">{text}</p>
      </div>
    </Card>
  );
}

export function Pager({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-sp-3 pt-sp-2">
      <Button
        variant="secondary"
        size="sm"
        iconLeft={ChevronLeft}
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Oldingi
      </Button>
      <span className="text-t-12 text-fg-3">
        {page} / {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        iconRight={ChevronRight}
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Keyingi
      </Button>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  text,
}: {
  icon: LucideIcon;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center gap-sp-2 py-sp-8 text-center">
      <Icon className="h-7 w-7 text-ilm-muted-2" />
      <p className="text-t-14 text-fg-3">{text}</p>
    </div>
  );
}
