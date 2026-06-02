import type { Metadata } from "next";

import { CategoriesSection } from "@/components/features/home/categories-section";
import { FaqSection } from "@/components/features/home/faq-section";
import { FeaturedCoursesSection } from "@/components/features/home/featured-courses-section";
import { HeroSection } from "@/components/features/home/hero-section";
import { InstructorCtaSection } from "@/components/features/home/instructor-cta-section";
import { InstructorsSection } from "@/components/features/home/instructors-section";
import { StatsSection } from "@/components/features/home/stats-section";
import { TestimonialsSection } from "@/components/features/home/testimonials-section";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "IlmHub — Kelajak kasbingizni bugun o'rganing",
  description:
    "O'zbekistondagi #1 IT ta'lim platformasi. Frontend, Backend, Dizayn, Data Science va boshqa yo'nalishlar bo'yicha onlayn kurslar.",
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <HeroSection />
      <StatsSection />
      <FeaturedCoursesSection />
      <CategoriesSection />
      <InstructorsSection />
      <TestimonialsSection />
      <InstructorCtaSection />
      <FaqSection />
    </>
  );
}
