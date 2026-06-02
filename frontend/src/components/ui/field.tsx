"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Icon } from "./icon";

const fieldVariants = cva(
  "flex h-12 items-center gap-2.5 bg-ilm-surface px-4 text-t-14 font-medium text-ilm-ink ring-1 ring-inset ring-transparent transition-[box-shadow,background-color] duration-base ease-ilm-out focus-within:bg-ilm-paper focus-within:ring-ilm-ink",
  {
    variants: {
      shape: {
        rounded: "rounded-ilm-md",
        pill: "rounded-ilm-full px-5",
      },
    },
    defaultVariants: {
      shape: "rounded",
    },
  }
);

type InputHTMLProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "prefix"
>;

export interface FieldProps
  extends InputHTMLProps,
    VariantProps<typeof fieldVariants> {
  icon?: LucideIcon;
  wrapperClassName?: string;
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ className, wrapperClassName, shape, icon, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          fieldVariants({ shape, className: wrapperClassName }),
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {icon && <Icon icon={icon} size={18} className="text-ilm-muted" />}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-ilm-ink outline-none placeholder:font-medium placeholder:text-ilm-muted disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
      </label>
    );
  }
);
Field.displayName = "Field";

export { fieldVariants };
