import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  linkHref,
  linkLabel,
  align = "between",
  className,
}: {
  title: string;
  subtitle?: string;
  linkHref?: string;
  linkLabel?: string;
  align?: "between" | "center";
  className?: string;
}) {
  if (align === "center") {
    return (
      <div className={cn("flex flex-col items-center gap-sp-3 text-center", className)}>
        <h2 className="text-t-32 font-extrabold leading-tight tracking-ilm-tight text-ilm-ink md:text-t-48">
          {title}
        </h2>
        {subtitle && (
          <p className="max-w-2xl text-t-16 leading-relaxed text-fg-2">{subtitle}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-sp-4 md:flex-row md:items-end md:justify-between md:gap-sp-6", className)}>
      <div className="flex flex-col gap-sp-2">
        <h2 className="text-t-32 font-extrabold leading-tight tracking-ilm-tight text-ilm-ink md:text-t-48">
          {title}
        </h2>
        {subtitle && (
          <p className="max-w-2xl text-t-16 leading-relaxed text-fg-2">{subtitle}</p>
        )}
      </div>
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="inline-flex shrink-0 items-center gap-sp-2 text-t-14 font-semibold text-ilm-ink transition-colors hover:text-ilm-muted-2"
        >
          {linkLabel}
          <Icon icon={ArrowRight} size={16} />
        </Link>
      )}
    </div>
  );
}
