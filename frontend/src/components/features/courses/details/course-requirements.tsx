import { Check } from "lucide-react";

import { Icon } from "@/components/ui/icon";

export function CourseChecklist({
  items,
  columns = 2,
}: {
  items: string[];
  columns?: 1 | 2;
}) {
  return (
    <ul
      className={
        columns === 2
          ? "grid gap-sp-3 md:grid-cols-2 md:gap-x-sp-6"
          : "flex flex-col gap-sp-3"
      }
    >
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-sp-3 text-t-14 leading-relaxed text-fg-2"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-ilm-full bg-ilm-ink text-white">
            <Icon icon={Check} size={12} strokeWidth={3} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CourseRequirements({ items }: { items: string[] }) {
  return (
    <section className="flex flex-col gap-sp-4">
      <h2 className="text-t-24 font-bold text-ilm-ink">Talablar</h2>
      <CourseChecklist items={items} columns={1} />
    </section>
  );
}
