import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StorySection } from "@/components/features/about/story-section";
import { ValuesSection } from "@/components/features/about/values-section";
import { TeamSection } from "@/components/features/about/team-section";
import { Mascot } from "@/components/features/home/mascot";
import { MotionSection } from "@/components/features/home/motion-section";
import { StatsSection } from "@/components/features/home/stats-section";

export const metadata: Metadata = {
  title: "Biz haqimizda",
  description:
    "IlmHub — O'zbekistondagi yetakchi onlayn IT ta'lim platformasi. Bizning missiyamiz, qadriyatlarimiz va jamoamiz haqida bilib oling.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Biz haqimizda",
    description:
      "IlmHub jamoasi, qadriyatlari va missiyasi bilan tanishing.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <MotionSection className="md:py-sp-20 lg:py-sp-20">
        <div className="grid items-center gap-sp-10 lg:grid-cols-[1.2fr_1fr] lg:gap-sp-16">
          <div className="flex flex-col gap-sp-6">
            <Badge icon={Sparkles} className="self-start">
              Biz haqimizda
            </Badge>

            <h1 className="text-t-48 font-extrabold leading-tight tracking-ilm-tight text-ilm-ink md:text-t-64">
              Bilim — har bir kelajakning poydevori
            </h1>

            <p className="max-w-xl text-t-18 leading-relaxed text-fg-2">
              IlmHub — O&apos;zbekistondagi yoshlarga sifatli IT ta&apos;lim
              imkoniyatini ochib beradigan platforma. Biz ustozlar, talabalar va
              ish beruvchilarni bir joyga to&apos;playmiz.
            </p>

            <div className="flex flex-col gap-sp-3 sm:flex-row">
              <Button variant="primary" size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/courses">
                  Kurslarni ko&apos;rish
                  <Icon icon={ArrowRight} size={20} />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/contact">Bog&apos;lanish</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center rounded-ilm-2xl bg-ilm-surface md:h-[420px] lg:max-w-none">
            <Mascot variant={1} size={320} />
          </div>
        </div>
      </MotionSection>

      <StorySection />
      <ValuesSection />
      <StatsSection />
      <TeamSection />

      <MotionSection>
        <div className="grid gap-sp-8 overflow-hidden rounded-ilm-2xl bg-ilm-ink p-sp-8 text-ilm-paper md:grid-cols-[1.5fr_1fr] md:gap-sp-10 md:p-sp-12">
          <div className="flex flex-col gap-sp-5">
            <Badge className="self-start bg-white/10 text-ilm-paper">
              Bizga qo&apos;shiling
            </Badge>
            <h2 className="text-t-32 font-extrabold leading-tight tracking-ilm-tight text-ilm-paper md:text-t-48">
              Yangi bilimlar dunyosiga qadam tashlang
            </h2>
            <p className="max-w-xl text-t-16 leading-relaxed text-white/70">
              Ro&apos;yxatdan o&apos;ting va bugundanoq o&apos;rganishni boshlang. Birinchi
              kursingiz hozir sizni kutmoqda.
            </p>
            <div>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/register">
                  Ro&apos;yxatdan o&apos;tish
                  <Icon icon={ArrowRight} size={20} />
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden items-center justify-center md:flex">
            <Mascot variant={2} size={220} />
          </div>
        </div>
      </MotionSection>
    </>
  );
}
