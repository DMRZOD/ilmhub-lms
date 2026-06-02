"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SaveStatus } from "@/features/course-wizard/hooks";

const MAP = {
  saving: { icon: Loader2, text: "Saqlanmoqda...", cls: "text-fg-3", spin: true },
  saved: { icon: Check, text: "Saqlandi", cls: "text-emerald-600", spin: false },
  error: {
    icon: AlertCircle,
    text: "Saqlashda xato",
    cls: "text-red-600",
    spin: false,
  },
} as const;

export function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const m = MAP[status];
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-t-12", m.cls)}>
      <Icon className={cn("h-3.5 w-3.5", m.spin && "animate-spin")} />
      {m.text}
    </span>
  );
}
