"use client";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { Field, type FieldProps } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type PasswordFieldProps = Omit<FieldProps, "icon" | "type">;

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ wrapperClassName, ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    return (
      <div className="relative">
        <Field
          ref={ref}
          icon={Lock}
          type={show ? "text" : "password"}
          wrapperClassName={cn("pr-12", wrapperClassName)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Parolni yashirish" : "Parolni ko'rsatish"}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ilm-muted transition-colors hover:text-ilm-ink focus-visible:outline-none focus-visible:text-ilm-ink"
          tabIndex={-1}
        >
          <Icon icon={show ? EyeOff : Eye} size={18} />
        </button>
      </div>
    );
  }
);
PasswordField.displayName = "PasswordField";
