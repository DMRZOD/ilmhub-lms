"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

import { Mascot } from "./mascot";
import { MotionSection } from "./motion-section";

export function InstructorCtaSection() {
  return (
    <MotionSection>
      <div className="grid gap-sp-8 overflow-hidden rounded-ilm-2xl bg-ilm-ink p-sp-8 text-ilm-paper md:grid-cols-[1.5fr_1fr] md:gap-sp-10 md:p-sp-12">
        <div className="flex flex-col gap-sp-5">
          <Badge className="self-start bg-white/10 text-ilm-paper">
            Ustoz bo&apos;ling
          </Badge>
          <h2 className="text-t-32 font-extrabold leading-tight tracking-ilm-tight text-ilm-paper md:text-t-48">
            Yangi kurs yaratmoqchimisiz?
          </h2>
          <p className="max-w-xl text-t-16 leading-relaxed text-white/70">
            Bilimingizni ming-minglab talabalar bilan ulashing. IlmHub
            platformasida o&apos;z kursingizni yarating va daromad oling.
          </p>
          <div>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/student/become-instructor">
                Ustoz bo&apos;lish
                <Icon icon={ArrowRight} size={20} />
              </Link>
            </Button>
          </div>
        </div>

        <div className="hidden items-center justify-center md:flex">
          <Mascot variant={2} size={400} />
        </div>
      </div>
    </MotionSection>
  );
}
