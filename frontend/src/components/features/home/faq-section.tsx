"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useHomeContent } from "@/features/home/content";

import { MotionSection } from "./motion-section";
import { SectionHeading } from "./section-heading";

const FAQS_FALLBACK = [
  {
    q: "Qanday qilib ro'yxatdan o'tish mumkin?",
    a: "Yuqori o'ng burchakdagi \"Ro'yxatdan o'tish\" tugmasini bosing va email yoki telefon raqamingizni kiriting. Bir necha daqiqada akkaunt tayyor bo'ladi.",
  },
  {
    q: "Kurslar uchun qanday to'lov usullari mavjud?",
    a: "Click, Payme, UzCard va Humo orqali to'lashingiz mumkin. Xalqaro talabalar uchun bank kartalari ham qabul qilinadi.",
  },
  {
    q: "Kursni tugatgach sertifikat olamanmi?",
    a: "Ha, har bir kursni 80%+ natija bilan tugatganingizdan so'ng raqamli sertifikat avtomatik tarzda profilingizga qo'shiladi.",
  },
  {
    q: "Kursni qaytarish mumkinmi?",
    a: "Sotib olgandan keyin 14 kun ichida 30%dan kam materialni tugatgan bo'lsangiz, to'liq qaytarib olish mumkin.",
  },
  {
    q: "Ustoz bilan bevosita aloqada bo'lish mumkinmi?",
    a: "Har bir kursda Q&A bo'limi va belgilangan vaqtlarda jonli sessiyalar mavjud. Pro tarif ustoz bilan shaxsiy maslahatni o'z ichiga oladi.",
  },
  {
    q: "Materialgaqachongacha kirish saqlanadi?",
    a: "Sotib olingan kurslarga umrbod kirish huquqi beriladi. Yangilangan dars va materiallar avtomatik tarzda qo'shiladi.",
  },
  {
    q: "Telefonimda dars ko'rishim mumkinmi?",
    a: "Ha, IlmHub to'liq moslashuvchan: brauzerda istalgan qurilmadan ochiladi. Mobil ilovalar 2026-yil oxirida chiqadi.",
  },
  {
    q: "O'zim kurs yaratishim mumkinmi?",
    a: '"Ustoz bo\'lish" sahifasidan ariza yuboring. Tasdiqlangan ustozlar IlmHub Studio orqali kurslar yaratib, daromad olishlari mumkin.',
  },
];

export function FaqSection() {
  const { data } = useHomeContent();
  const faqs = data?.faqs?.length
    ? data.faqs.map((f) => ({ q: f.question, a: f.answer }))
    : FAQS_FALLBACK;

  return (
    <MotionSection id="faq">
      <SectionHeading
        title="Tez-tez so'raladigan savollar"
        subtitle="Eng ko'p uchraydigan savollarga javoblar."
        align="center"
      />
      <div className="mx-auto mt-sp-10 max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-t-16 font-semibold text-ilm-ink hover:no-underline md:text-t-18">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-t-14 leading-relaxed text-fg-2 md:text-t-16">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </MotionSection>
  );
}
