"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { TestimonialCard } from "@/components/features/testimonials/testimonial-card";
import { Button } from "@/components/ui/button";
import { testimonials as fallbackTestimonials } from "@/mocks/testimonials";
import { useHomeContent } from "@/features/home/content";
import type { Testimonial } from "@/types/testimonial";

import { MotionSection } from "./motion-section";
import { SectionHeading } from "./section-heading";

export function TestimonialsSection() {
  const { data } = useHomeContent();
  const testimonials: Testimonial[] = data?.testimonials?.length
    ? data.testimonials.map((t) => ({
        id: t.id,
        studentName: t.studentName,
        studentAvatar: t.studentAvatar ?? "",
        studentRole: t.studentRole ?? "",
        courseName: t.courseName ?? "",
        rating: t.rating,
        text: t.text,
      }))
    : fallbackTestimonials;

  const autoplay = React.useRef(
    Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [autoplay.current]
  );

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <MotionSection>
      <SectionHeading
        title="Talabalarimiz nima deyishadi"
        subtitle="IlmHub'da o'qigan haqiqiy odamlarning tajribasi."
      />

      <div className="mt-sp-10 flex flex-col gap-sp-6">
        <div ref={emblaRef} className="overflow-hidden">
          {/* Spacing via per-slide padding-left + negative container margin
              (not CSS `gap`): with loop:true, flex `gap` isn't rendered at the
              seam where Embla transforms the first slide after the last, so the
              ends would stick together. Per-slide padding travels with each
              slide, keeping the gap consistent around the loop. */}
          <div className="-ml-sp-5 flex">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="min-w-0 flex-[0_0_100%] pl-sp-5 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <TestimonialCard testimonial={t} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-sp-2">
          <Button
            variant="secondary"
            size="sm"
            iconLeft={ChevronLeft}
            iconOnly
            onClick={scrollPrev}
            aria-label="Oldingi sharh"
          />
          <Button
            variant="secondary"
            size="sm"
            iconLeft={ChevronRight}
            iconOnly
            onClick={scrollNext}
            aria-label="Keyingi sharh"
          />
        </div>
      </div>
    </MotionSection>
  );
}
