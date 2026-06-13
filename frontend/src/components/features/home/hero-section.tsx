"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useHomeContent } from "@/features/home/content";

const HERO_FALLBACK = {
  title: "Kelajak kasbingizni bugun o'rganing",
  subtitle:
    "Eng yaxshi ustozlardan onlayn kurslar. O'zingiz uchun mos sur'atda o'rganing, real loyihalar ustida ishlang va sertifikat oling.",
  primaryCtaLabel: "Kurslarni ko'rish",
  primaryCtaHref: "/courses",
  secondaryCtaLabel: "Bepul boshlash",
  secondaryCtaHref: "/courses?price=free",
};

// The secondary CTA always opens the catalogue filtered to free courses,
// regardless of any stale CMS-configured href.
const FREE_COURSES_HREF = "/courses?price=free";

// The project easing curve ("ilm-out"), shared with Button and MotionSection.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Staggered on-load reveal: the content column orchestrates its children
// (eyebrow → headline → subtitle → CTAs) fading up one after another.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export function HeroSection() {
  const { data } = useHomeContent();
  const hero = data?.hero ?? HERO_FALLBACK;
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[640px] h-[calc(100svh-4rem)] w-full items-center overflow-hidden bg-ilm-ink lg:h-[calc(100svh-5rem)]">
      {/* Looping background video. Decorative, muted, autoplaying. A light
          grayscale nudges it toward the monochrome design language; the solid
          bg-ilm-ink behind it covers the gap before the video buffers. */}
      <video
        className="absolute inset-0 h-full w-full object-cover grayscale-[.35]"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Scrims for legibility: a left-weighted wash for the text column and a
          bottom-up fade so the headline and scroll cue stay readable. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"
      />

      <motion.div
        variants={container}
        initial={reduceMotion ? "show" : "hidden"}
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start gap-sp-6 px-sp-4 md:px-sp-6"
      >
        <motion.p
          variants={item}
          className="text-t-12 font-semibold uppercase tracking-[0.18em] text-white/70"
        >
          Onlayn kurslar • Amaliy loyihalar • Sertifikatlar
        </motion.p>

        <motion.h1
          variants={item}
          className="max-w-3xl text-t-48 font-extrabold leading-[1.05] tracking-ilm-tight text-white md:text-t-64"
        >
          {hero.title}
        </motion.h1>

        <motion.p
          variants={item}
          className="max-w-xl text-t-18 leading-relaxed text-white/80"
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-sp-2 flex w-full flex-col gap-sp-3 sm:w-auto sm:flex-row"
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full bg-white text-ilm-ink hover:bg-white/90 sm:w-auto"
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
            className="w-full bg-white/10 text-white ring-white/30 backdrop-blur-sm hover:bg-white/20 hover:text-white sm:w-auto"
            asChild
          >
            <Link href={FREE_COURSES_HREF}>{hero.secondaryCtaLabel}</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-sp-6 z-10 flex justify-center text-white/60"
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon icon={ChevronDown} size={24} />
      </motion.div>
    </section>
  );
}
