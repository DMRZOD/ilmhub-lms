"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface StarInputProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
  className?: string;
}

/** Interactive 1–5 star rating input (hover + click + keyboard). */
export function StarInput({
  value,
  onChange,
  size = 28,
  readOnly = false,
  className,
}: StarInputProps) {
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? value;

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role={readOnly ? undefined : "radiogroup"}
      aria-label="Baho (yulduzlarda)"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= active;
        if (readOnly) {
          return (
            <Icon
              key={n}
              icon={Star}
              size={size}
              className={
                filled ? "fill-ilm-warning text-ilm-warning" : "text-ilm-border"
              }
            />
          );
        }
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} yulduz`}
            className="rounded-full p-0.5 transition-transform duration-base ease-ilm-out hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ilm-ink"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(null)}
            onClick={() => onChange?.(n)}
          >
            <Icon
              icon={Star}
              size={size}
              className={cn(
                "transition-colors duration-base ease-ilm-out",
                filled
                  ? "fill-ilm-warning text-ilm-warning"
                  : "text-ilm-border",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
