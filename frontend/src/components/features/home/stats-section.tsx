"use client";

import * as React from "react";
import { animate, useInView } from "framer-motion";

import { useHomeContent } from "@/features/home/content";

import { MotionSection } from "./motion-section";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS_FALLBACK: Stat[] = [
  { value: 10000, suffix: "+", label: "talaba" },
  { value: 200, suffix: "+", label: "kurs" },
  { value: 50, suffix: "+", label: "ustoz" },
  { value: 95, suffix: "%", label: "tugatish darajasi" },
];

function formatNumber(n: number) {
  if (n >= 1000) {
    return new Intl.NumberFormat("uz-UZ").format(n);
  }
  return String(n);
}

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {formatNumber(value)}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const { data } = useHomeContent();
  const stats = data?.stats?.length ? data.stats : STATS_FALLBACK;

  return (
    <MotionSection className="py-sp-12 md:py-sp-16">
      <div className="grid gap-sp-6 rounded-ilm-2xl bg-ilm-ink px-sp-6 py-sp-10 text-ilm-paper md:grid-cols-4 md:px-sp-12 md:py-sp-12">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-sp-2 text-center">
            <div className="text-t-48 font-extrabold leading-tight tracking-ilm-tight text-ilm-paper md:text-t-64">
              <CountUp to={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-t-14 font-medium uppercase tracking-ilm-wide text-white/70">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </MotionSection>
  );
}
