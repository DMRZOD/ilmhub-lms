"use client";

import { Check, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

export type WizardStepDef = { id: number; label: string; enabled: boolean };

export const WIZARD_STEPS: WizardStepDef[] = [
  { id: 1, label: "Asosiy", enabled: true },
  { id: 2, label: "Rasm", enabled: true },
  { id: 3, label: "Tavsif", enabled: true },
  { id: 4, label: "Dastur", enabled: true },
  { id: 5, label: "Videolar", enabled: true },
  { id: 6, label: "Kod", enabled: true },
  { id: 7, label: "Testlar", enabled: true },
  { id: 8, label: "Nashr", enabled: true },
];

export const MAX_ENABLED_STEP = WIZARD_STEPS.filter((s) => s.enabled).length;

export function WizardStepper({
  current,
  onSelect,
}: {
  current: number;
  onSelect: (step: number) => void;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-sp-2">
      {WIZARD_STEPS.map((s) => {
        const active = s.id === current;
        const done = s.id < current && s.enabled;
        return (
          <button
            key={s.id}
            type="button"
            disabled={!s.enabled}
            onClick={() => s.enabled && onSelect(s.id)}
            title={s.enabled ? s.label : "Keyingi bosqichda"}
            className={cn(
              "flex items-center gap-sp-2 rounded-ilm-full px-sp-3 py-sp-2 text-t-12 font-semibold transition",
              active
                ? "bg-ilm-ink text-white"
                : s.enabled
                  ? "bg-ilm-surface text-ilm-ink hover:bg-ilm-border"
                  : "cursor-not-allowed bg-ilm-surface text-fg-3 opacity-60",
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-ilm-full text-[10px] font-bold",
                active
                  ? "bg-white text-ilm-ink"
                  : s.enabled
                    ? "bg-ilm-ink text-white"
                    : "bg-ilm-border text-fg-3",
              )}
            >
              {done ? (
                <Check className="h-3 w-3" />
              ) : s.enabled ? (
                s.id
              ) : (
                <Lock className="h-2.5 w-2.5" />
              )}
            </span>
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}
