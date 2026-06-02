import { Mascot } from "@/components/features/home/mascot";
import { cn } from "@/lib/utils";

const STATS = [
  { n: "48k+", l: "Talabalar" },
  { n: "320+", l: "Kurslar" },
  { n: "120+", l: "Mentorlar" },
];

export function AuthBrandPanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex flex-col justify-between bg-ilm-surface px-sp-12 py-sp-12",
        className
      )}
    >
      <div className="flex-1 flex flex-col items-start justify-center gap-sp-6 max-w-md">
        <Mascot variant={1} size={320} />
        <h2 className="text-t-48 font-extrabold leading-tight tracking-ilm-tight text-ilm-ink">
          Bilim yangi imkoniyatlar ochadi.
        </h2>
        <p className="text-t-16 leading-relaxed font-medium text-fg-2 max-w-sm">
          48,000+ talaba IT yo&apos;lini IlmHub bilan boshlagan. Siz ham bugun
          qo&apos;shiling.
        </p>
      </div>
      <div className="flex gap-sp-8 pt-sp-6 text-ilm-ink">
        {STATS.map((s) => (
          <div key={s.l} className="flex flex-col leading-tight">
            <span className="text-t-24 font-extrabold tracking-ilm-tight">{s.n}</span>
            <span className="text-t-12 font-semibold text-fg-2">{s.l}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
