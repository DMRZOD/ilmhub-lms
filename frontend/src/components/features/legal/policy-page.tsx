import { MotionSection } from "@/components/features/home/motion-section";

interface PolicySection {
  heading: string;
  body: string[];
}

interface PolicyPageProps {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: PolicySection[];
}

export function PolicyPage({ title, intro, lastUpdated, sections }: PolicyPageProps) {
  return (
    <MotionSection className="md:py-sp-20 lg:py-sp-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-sp-4">
        <span className="text-t-14 font-semibold uppercase tracking-ilm-wide text-ilm-muted-2">
          Oxirgi yangilanish: {lastUpdated}
        </span>
        <h1 className="text-t-48 font-extrabold leading-tight tracking-ilm-tight text-ilm-ink md:text-t-64">
          {title}
        </h1>
        <p className="text-t-18 leading-relaxed text-fg-2">{intro}</p>
      </div>

      <div className="mx-auto mt-sp-12 flex max-w-3xl flex-col gap-sp-10">
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-sp-3">
            <h2 className="text-t-24 font-bold text-ilm-ink">{section.heading}</h2>
            {section.body.map((paragraph, idx) => (
              <p key={idx} className="text-t-16 leading-relaxed text-fg-2">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </MotionSection>
  );
}
