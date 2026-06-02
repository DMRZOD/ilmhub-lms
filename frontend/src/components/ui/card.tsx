import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-ilm-2xl transition-[transform,box-shadow] duration-base ease-ilm-out",
  {
    variants: {
      variant: {
        paper: "bg-ilm-paper shadow-ilm-sm",
        surface: "bg-ilm-surface shadow-none",
      },
      hoverable: {
        true: "hover:-translate-y-0.5 hover:shadow-ilm-md",
        false: "",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "paper",
      hoverable: false,
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({
  className,
  variant,
  hoverable,
  padding,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, hoverable, padding, className }))}
      {...props}
    />
  );
}

export { cardVariants };
