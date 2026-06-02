"use client";

import { cn } from "@/lib/utils";
import { scorePassword } from "../utils";

const SEGMENT_TONE = [
  "bg-ilm-error",
  "bg-ilm-error",
  "bg-ilm-warning",
  "bg-ilm-info",
  "bg-ilm-success",
] as const;

export function PasswordStrengthMeter({ value }: { value: string }) {
  const { score, label } = scorePassword(value);
  const tone = SEGMENT_TONE[score];
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-base ease-ilm-out",
              i < score ? tone : "bg-ilm-border"
            )}
          />
        ))}
      </div>
      <span className="min-w-[64px] text-right text-t-12 font-medium text-fg-3">
        {value ? label : ""}
      </span>
    </div>
  );
}
