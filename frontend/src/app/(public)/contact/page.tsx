import type { Metadata } from "next";

import { ContactForm } from "@/components/features/contact/contact-form";
import { ContactInfo } from "@/components/features/contact/contact-info";
import { MotionSection } from "@/components/features/home/motion-section";

export const metadata: Metadata = {
  title: "Bog'lanish",
  description:
    "IlmHub jamoasiga savol bering, taklif yuboring yoki hamkorlikni muhokama qiling. Telefon, email va ofis manzili.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Bog'lanish",
    description: "IlmHub jamoasi bilan bog'lanish kanallari.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <MotionSection className="md:py-sp-20 lg:py-sp-20">
      <div className="flex flex-col gap-sp-4">
        <h1 className="text-t-48 font-extrabold leading-tight tracking-ilm-tight text-ilm-ink md:text-t-64">
          Bog&apos;lanish
        </h1>
        <p className="max-w-2xl text-t-18 leading-relaxed text-fg-2">
          Savolingiz, taklifingiz yoki hamkorlik istagi bormi? Bizga yozing —
          tez orada javob beramiz.
        </p>
      </div>

      <div className="mt-sp-12 grid gap-sp-10 md:grid-cols-[1fr_1.2fr]">
        <ContactInfo />
        <ContactForm />
      </div>
    </MotionSection>
  );
}
