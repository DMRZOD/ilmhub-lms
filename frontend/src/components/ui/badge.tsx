import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Icon } from "./icon";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-ilm-full px-3 py-1.5 text-t-12 font-semibold leading-none",
  {
    variants: {
      tone: {
        neutral: "bg-ilm-surface text-ilm-ink",
        success: "bg-ilm-success-bg text-ilm-success",
        warning: "bg-ilm-warning-bg text-ilm-warning",
        error: "bg-ilm-error-bg text-ilm-error",
        info: "bg-ilm-info-bg text-ilm-info",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: LucideIcon;
}

export function Badge({
  className,
  tone,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, className }))} {...props}>
      {icon && <Icon icon={icon} size={12} />}
      {children}
    </span>
  );
}

export { badgeVariants };
