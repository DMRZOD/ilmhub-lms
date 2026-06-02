"use client";

import { LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS } from "@/lib/courses-filter";
import type { SortKey, ViewMode } from "@/lib/courses-filter";

interface CatalogTopbarProps {
  q: string;
  onSearch: (v: string) => void;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  count: number;
  onOpenMobileFilters: () => void;
}

export function CatalogTopbar({
  q,
  onSearch,
  sort,
  onSortChange,
  view,
  onViewChange,
  count,
  onOpenMobileFilters,
}: CatalogTopbarProps) {
  return (
    <div className="flex flex-col gap-sp-4">
      <div className="flex flex-col gap-sp-3 sm:flex-row sm:items-center">
        <Field
          icon={Search}
          shape="pill"
          placeholder="Kurs qidiring..."
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          wrapperClassName="flex-1"
        />

        <Button
          variant="secondary"
          size="md"
          iconLeft={SlidersHorizontal}
          onClick={onOpenMobileFilters}
          className="lg:hidden"
        >
          Filtrlar
        </Button>

        <Select value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
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

        <div className="hidden items-center gap-1 rounded-ilm-md bg-ilm-surface p-1 sm:flex">
          <button
            type="button"
            aria-label="Grid ko'rinish"
            aria-pressed={view === "grid"}
            onClick={() => onViewChange("grid")}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-[8px] transition-colors",
              view === "grid"
                ? "bg-ilm-paper text-ilm-ink shadow-ilm-xs"
                : "text-fg-3 hover:text-ilm-ink"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="List ko'rinish"
            aria-pressed={view === "list"}
            onClick={() => onViewChange("list")}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-[8px] transition-colors",
              view === "list"
                ? "bg-ilm-paper text-ilm-ink shadow-ilm-xs"
                : "text-fg-3 hover:text-ilm-ink"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="text-t-14 font-medium text-fg-2">
        {count} ta kurs topildi
      </div>
    </div>
  );
}
