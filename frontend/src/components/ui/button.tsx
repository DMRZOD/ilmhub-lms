"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Icon } from "./icon";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-ilm-snug transition-colors duration-base ease-ilm-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ilm-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ilm-paper disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ilm-ink text-white hover:bg-ilm-ink-soft",
        secondary:
          "bg-ilm-paper text-ilm-ink ring-1 ring-inset ring-ilm-ink hover:bg-ilm-surface",
        ghost: "bg-transparent text-ilm-ink hover:bg-ilm-surface",
      },
      size: {
        sm: "h-9 px-3.5 text-t-14 rounded-[10px]",
        md: "h-12 px-5 text-t-14 rounded-ilm-md",
        lg: "h-14 px-7 text-t-16 rounded-[14px]",
      },
      iconOnly: {
        true: "px-0",
        false: "",
      },
    },
    compoundVariants: [
      { iconOnly: true, size: "sm", class: "w-9" },
      { iconOnly: true, size: "md", class: "w-12" },
      { iconOnly: true, size: "lg", class: "w-14" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      iconOnly: false,
    },
  }
);

const ICON_SIZE = { sm: 14, md: 18, lg: 20 } as const;

type ButtonHTMLProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  keyof HTMLMotionProps<"button">
>;

export interface ButtonProps
  extends ButtonHTMLProps,
    Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
  asChild?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size = "md",
      iconLeft,
      iconRight,
      children,
      iconOnly,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const resolvedSize = size ?? "md";
    const onlyIcon = iconOnly ?? (!children && Boolean(iconLeft ?? iconRight));
    const glyph = ICON_SIZE[resolvedSize];

    const classes = cn(
      buttonVariants({ variant, size: resolvedSize, iconOnly: onlyIcon, className })
    );

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...(props as React.HTMLAttributes<HTMLElement>)}>
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className={classes}
        {...props}
      >
        {iconLeft && <Icon icon={iconLeft} size={glyph} />}
        {children}
        {iconRight && <Icon icon={iconRight} size={glyph} />}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
