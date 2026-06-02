import { Heart, Lightbulb, Target, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Icon } from "@/components/ui/icon";
import { MotionSection } from "@/components/features/home/motion-section";
import { SectionHeading } from "@/components/features/home/section-heading";

interface Value {
  icon: LucideIcon;
  title: string;
  description: string;
}

const values: Value[] = [
  {
    icon: Target,
    title: "Aniq maqsad",
    description:
      "Har bir kurs aniq natijaga olib boradi: yangi ko'nikma, portfolio loyihasi va ish bozorida tayyor mutaxassis.",
  },
  {
    icon: Users,
    title: "Hamjamiyat",
    description:
      "O'rganish yakka emas — talabalar, ustozlar va bitiruvchilarning kuchli hamjamiyati bir-birini qo'llab-quvvatlaydi.",
  },
  {
    icon: Lightbulb,
    title: "Amaliy bilim",
    description:
      "Nazariya muhim, lekin amaliyot hal qiladi. Har bir mavzu real loyihalar va sanoatdagi misollar orqali o'rgatiladi.",
  },
  {
    icon: Heart,
    title: "Halol munosabat",
    description:
      "Talabalar ishonchini qadrlaymiz: shaffof narxlar, sifatli kontent va har qanday savolga ochiq javob.",
  },
];

export function ValuesSection() {
  return (
    <MotionSection>
      <SectionHeading
        title="Bizning qadriyatlarimiz"
        subtitle="Har bir qarorimiz mana shu to'rt tamoyilga asoslangan."
        align="center"
      />
      <div className="mt-sp-10 grid gap-sp-6 md:grid-cols-2 lg:grid-cols-4">
        {values.map((value) => (
          <div
            key={value.title}
            className="flex flex-col gap-sp-4 rounded-ilm-2xl bg-ilm-surface p-sp-6"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-ilm-md bg-ilm-paper">
              <Icon icon={value.icon} size={22} className="text-ilm-ink" />
            </div>
            <div className="flex flex-col gap-sp-2">
              <h3 className="text-t-18 font-bold text-ilm-ink">{value.title}</h3>
              <p className="text-t-14 leading-relaxed text-fg-2">
                {value.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </MotionSection>
  );
}
