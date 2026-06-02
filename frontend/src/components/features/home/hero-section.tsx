"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { useHomeContent } from "@/features/home/content";

import { MotionSection } from "./motion-section";
import { Mascot } from "./mascot";

const HERO_FALLBACK = {
  title: "Kelajak kasbingizni bugun o'rganing",
  subtitle:
    "Eng yaxshi ustozlardan onlayn kurslar. O'zingiz uchun mos sur'atda o'rganing, real loyihalar ustida ishlang va sertifikat oling.",
  primaryCtaLabel: "Kurslarni ko'rish",
  primaryCtaHref: "/courses",
  secondaryCtaLabel: "Bepul boshlash",
  secondaryCtaHref: "/register",
};

export function HeroSection() {
  const { data } = useHomeContent();
  const hero = data?.hero ?? HERO_FALLBACK;

  return (
    <MotionSection className="md:py-sp-20 lg:py-sp-20">
      <div className="grid items-center gap-sp-10 lg:grid-cols-[1.2fr_1fr] lg:gap-sp-16">
        <div className="flex flex-col gap-sp-6">
          <h1 className="text-t-48 font-extrabold leading-tight tracking-ilm-tight text-ilm-ink md:text-t-64">
            {hero.title}
          </h1>

          <p className="max-w-xl text-t-18 leading-relaxed text-fg-2">
            {hero.subtitle}
          </p>

          <div className="max-w-xl">
            <Field
              shape="pill"
              icon={Search}
              placeholder="Kurs nomini yoki kategoriyani qidiring..."
              aria-label="Kurs qidirish"
            />
          </div>

          <div className="flex flex-col gap-sp-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href={hero.primaryCtaHref}>
                {hero.primaryCtaLabel}
                <Icon icon={ArrowRight} size={20} />
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href={hero.secondaryCtaHref}>{hero.secondaryCtaLabel}</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center rounded-ilm-2xl bg-ilm-surface md:h-[420px] lg:max-w-none">
          <Mascot variant={1} size={400} />
        </div>
      </div>
    </MotionSection>
  );
}
