import { MotionSection } from "@/components/features/home/motion-section";
import { SectionHeading } from "@/components/features/home/section-heading";

export function StorySection() {
  return (
    <MotionSection>
      <SectionHeading
        title="Bizning hikoyamiz"
        subtitle="IlmHub qanday paydo bo'ldi va biz nimaga intilamiz."
        align="center"
      />
      <div className="mx-auto mt-sp-10 flex max-w-3xl flex-col gap-sp-5 text-t-16 leading-relaxed text-fg-2">
        <p>
          IlmHub 2024-yilda kichik bir g&apos;oyadan boshlandi: O&apos;zbekistondagi
          har bir iste&apos;dodli yoshga jahon darajasidagi IT ta&apos;lim oson va
          arzon bo&apos;lishi kerak. Toshkentdagi bir nechta dasturchi do&apos;stlar
          birlashib, dastlabki kurslarni mahalliy talabalar uchun ona tilida
          tayyorladi.
        </p>
        <p>
          Bugun IlmHub — bu o&apos;n minglab talaba, yuzlab kurs va eng yaxshi
          mahalliy ustozlarni birlashtirgan platforma. Biz nafaqat darslarni
          taqdim etamiz, balki o&apos;rganishni hayotiy ko&apos;nikmaga aylantirishga
          yordam beradigan jamoa quryapmiz.
        </p>
        <p>
          Bizning vazifamiz — har bir foydalanuvchiga o&apos;z sur&apos;atida o&apos;rganish,
          real loyihalar ustida ishlash va kelajak kasbini ishonchli tanlash
          uchun zarur asboblarni berishdir. Biz ishonamizki, bilim ulashilganda
          ko&apos;payadi.
        </p>
      </div>
    </MotionSection>
  );
}
