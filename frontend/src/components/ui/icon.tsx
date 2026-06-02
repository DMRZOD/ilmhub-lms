import * as React from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

import { cn } from "@/lib/utils";

export interface IconProps extends Omit<LucideProps, "ref" | "size"> {
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
}

export function Icon({
  icon: IconComponent,
  size = 20,
  strokeWidth,
  className,
  ...props
}: IconProps) {
  const stroke = strokeWidth ?? (size > 32 ? 1.5 : 2);
  return (
    <IconComponent
      width={size}
      height={size}
      strokeWidth={stroke}
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
