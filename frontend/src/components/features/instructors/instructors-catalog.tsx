"use client";

import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mascot } from "@/components/features/home/mascot";
import { useInstructors } from "@/features/instructors/hooks";
import type { InstructorSort } from "@/types/api";

import { InstructorCard } from "./instructor-card";

const SORT_VALUES = ["popular", "rating", "new"] as const;

const SORT_OPTIONS: Array<{ value: InstructorSort; label: string }> = [
  { value: "popular", label: "Mashhurlik bo'yicha" },
  { value: "rating", label: "Reyting bo'yicha" },
  { value: "new", label: "Yangi" },
];

const PAGE_SIZE = 20;

export function InstructorsCatalog() {
  const [q, setQ] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  );

  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringEnum([...SORT_VALUES])
      .withDefault("popular")
      .withOptions({ clearOnDefault: true }),
  );

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  );

  const { data, isPending, isError, refetch } = useInstructors({
    page: Math.max(1, page ?? 1),
    limit: PAGE_SIZE,
    search: q.trim() || undefined,
    sort: (sort ?? "popular") as InstructorSort,
  });

  const items = data?.items ?? [];
  const meta = data?.meta;

  function resetPage() {
    if (page !== 1 && page !== null) setPage(1);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-sp-8 px-sp-4 py-sp-8 sm:px-sp-6 lg:py-sp-12">
      <header className="flex flex-col gap-sp-2">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink sm:text-t-48">
          Ustozlar
        </h1>
        <p className="max-w-2xl text-t-16 text-fg-2">
          Soha mutaxassislaridan to&apos;g&apos;ridan-to&apos;g&apos;ri o&apos;rganing.
          O&apos;zingizga mos ustozni toping va kurslarini ko&apos;ring.
        </p>
      </header>

      <div className="flex flex-col gap-sp-4">
        <div className="flex flex-col gap-sp-3 sm:flex-row sm:items-center">
          <Field
            icon={Search}
            shape="pill"
            placeholder="Ustoz nomi bo'yicha qidiring..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              resetPage();
            }}
            wrapperClassName="flex-1"
          />

          <Select
            value={sort ?? "popular"}
            onValueChange={(v) => {
              setSort(v as InstructorSort);
              resetPage();
            }}
          >
            <SelectTrigger className="h-12 w-full rounded-ilm-md border-ilm-border bg-ilm-surface px-4 text-t-14 font-medium text-ilm-ink shadow-none sm:w-64">
              <SelectValue placeholder="Saralash" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {meta && (
          <div className="text-t-14 font-medium text-fg-2">
            {meta.total} ta ustoz topildi
          </div>
        )}
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
          <h3 className="text-t-24 font-bold text-ilm-ink">
            Ustozlarni yuklab bo&apos;lmadi
          </h3>
          <Button variant="primary" size="md" onClick={() => refetch()}>
            Qayta yuklash
          </Button>
        </div>
      ) : isPending ? (
        <div className="grid gap-sp-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-ilm-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
          <div className="grid place-items-center rounded-ilm-2xl bg-ilm-ink p-sp-5">
            <Mascot variant={3} size={160} className="opacity-90" />
          </div>
          <h3 className="text-t-24 font-bold text-ilm-ink">
            Hech qanday ustoz topilmadi
          </h3>
          <p className="max-w-md text-t-14 text-fg-2">
            Qidiruv so&apos;rovini o&apos;zgartirib qayta urinib ko&apos;ring.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setQ("");
              resetPage();
            }}
          >
            Qidiruvni tozalash
          </Button>
        </div>
      ) : (
        <div className="grid gap-sp-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      )}
    </div>
  );
}
