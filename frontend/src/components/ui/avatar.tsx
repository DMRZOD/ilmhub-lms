"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-ilm-full font-bold uppercase",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-t-12",
        md: "h-12 w-12 text-t-14",
        lg: "h-20 w-20 text-t-24",
      },
      ink: {
        true: "bg-ilm-ink text-white",
        false: "bg-ilm-border text-fg-2",
      },
    },
    defaultVariants: {
      size: "md",
      ink: false,
    },
  }
);

export interface AvatarProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
      "children"
    >,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  initials?: string;
}

export const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, ink, src, alt = "", initials, ...props }, ref) => {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size, ink, className }))}
      {...props}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        delayMs={src ? 200 : 0}
        className="flex h-full w-full items-center justify-center"
      >
        {initials?.slice(0, 2)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = "Avatar";

export { avatarVariants };
