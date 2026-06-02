import { Quote, Star } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/testimonial";

export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  return (
    <Card
      variant="surface"
      padding="lg"
      className={cn("flex h-full flex-col gap-sp-5 bg-ilm-surface", className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-sp-1" aria-label={`${testimonial.rating} yulduzdan ${testimonial.rating}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              key={i}
              icon={Star}
              size={16}
              className={i < testimonial.rating ? "text-ilm-warning" : "text-ilm-border"}
            />
          ))}
        </div>
        <Icon icon={Quote} size={28} className="text-ilm-border" />
      </div>

      <p className="text-t-16 leading-relaxed text-fg-1 line-clamp-6">
        {testimonial.text}
      </p>

      <div className="mt-auto flex items-center gap-sp-3 border-t border-ilm-border pt-sp-4">
        <Avatar size="md" src={testimonial.studentAvatar} alt={testimonial.studentName} />
        <div className="flex flex-col">
          <span className="text-t-14 font-semibold text-ilm-ink">
            {testimonial.studentName}
          </span>
          <span className="text-t-12 text-fg-3">{testimonial.studentRole}</span>
        </div>
      </div>
    </Card>
  );
}
