import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Icon } from "./icon";

const tileVariants = cva(
  "inline-flex shrink-0 items-center justify-center transition-colors duration-base ease-ilm-out",
  {
    variants: {
      variant: {
        ink: "bg-ilm-ink text-white",
        surface: "bg-ilm-surface text-ilm-ink",
      },
      size: {
        sm: "h-9 w-9 rounded-[10px]",
        md: "h-12 w-12 rounded-[14px]",
        lg: "h-16 w-16 rounded-ilm-lg",
      },
    },
    defaultVariants: {
      variant: "surface",
      size: "md",
    },
  }
);

const GLYPH_SIZE = { sm: 18, md: 22, lg: 28 } as const;

export interface TileProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tileVariants> {
  icon?: LucideIcon;
}

export function Tile({
  className,
  variant,
  size = "md",
  icon,
  children,
  ...props
}: TileProps) {
  const resolvedSize = size ?? "md";
  return (
    <div
      className={cn(tileVariants({ variant, size: resolvedSize, className }))}
      {...props}
    >
      {icon ? <Icon icon={icon} size={GLYPH_SIZE[resolvedSize]} /> : children}
    </div>
  );
}

export { tileVariants };
