"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LANGUAGE_LABELS, LEVEL_LABELS } from "@/lib/format";
import {
  DURATION_BUCKETS,
  PRICE_BUCKETS,
  RATING_OPTIONS,
} from "@/lib/courses-filter";
import type { CourseFilters } from "@/lib/courses-filter";
import type {
  Category,
  CourseLanguage,
  CourseLevel,
} from "@/types/api";

interface FilterSidebarProps {
  filters: CourseFilters;
  categories: Category[];
  categoriesLoading: boolean;
  onSetCategory: (slug: string | null) => void;
  onSetLevel: (level: CourseLevel | null) => void;
  onTogglePrice: (bucketId: string) => void;
  onSetRating: (rating: number | null) => void;
  onToggleDuration: (bucketId: string) => void;
  onToggleLanguage: (lang: CourseLanguage) => void;
  onClear: () => void;
  hideCategories?: boolean;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-sp-3">
      <h3 className="text-t-14 font-semibold uppercase tracking-ilm-wide text-fg-3">
        {title}
      </h3>
      <div className="flex flex-col gap-sp-2">{children}</div>
    </div>
  );
}

function CheckRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-sp-3 text-t-14 font-medium text-ilm-ink"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

const LANGUAGE_KEYS: CourseLanguage[] = ["UZ", "RU", "EN"];
const LEVEL_KEYS: CourseLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export function FilterSidebar({
  filters,
  categories,
  categoriesLoading,
  onSetCategory,
  onSetLevel,
  onTogglePrice,
  onSetRating,
  onToggleDuration,
  onToggleLanguage,
  onClear,
  hideCategories = false,
}: FilterSidebarProps) {
  const levelValue = filters.level ?? "__any";
  const ratingValue = filters.rating != null ? String(filters.rating) : "__any";
  const categoryValue = filters.categorySlug ?? "__any";

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex items-center justify-between">
        <h2 className="text-t-18 font-bold text-ilm-ink">Filtrlar</h2>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Tozalash
        </Button>
      </div>

      {!hideCategories && (
        <>
          <Section title="Kategoriya">
            {categoriesLoading ? (
              <div className="flex flex-col gap-sp-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-3/4" />
                ))}
              </div>
            ) : (
              <RadioGroup
                value={categoryValue}
                onValueChange={(v) => onSetCategory(v === "__any" ? null : v)}
              >
                <Label
                  htmlFor="cat-any"
                  className="flex cursor-pointer items-center gap-sp-3 text-t-14 font-medium text-ilm-ink"
                >
                  <RadioGroupItem id="cat-any" value="__any" />
                  Barchasi
                </Label>
                {categories.map((cat) => (
                  <Label
                    key={cat.slug}
                    htmlFor={`cat-${cat.slug}`}
                    className="flex cursor-pointer items-center gap-sp-3 text-t-14 font-medium text-ilm-ink"
                  >
                    <RadioGroupItem id={`cat-${cat.slug}`} value={cat.slug} />
                    {cat.name}
                  </Label>
                ))}
              </RadioGroup>
            )}
          </Section>

          <Separator />
        </>
      )}

      <Section title="Daraja">
        <RadioGroup
          value={levelValue}
          onValueChange={(v) =>
            onSetLevel(v === "__any" ? null : (v as CourseLevel))
          }
        >
          <Label
            htmlFor="lvl-any"
            className="flex cursor-pointer items-center gap-sp-3 text-t-14 font-medium text-ilm-ink"
          >
            <RadioGroupItem id="lvl-any" value="__any" />
            Barchasi
          </Label>
          {LEVEL_KEYS.map((lvl) => (
            <Label
              key={lvl}
              htmlFor={`lvl-${lvl}`}
              className="flex cursor-pointer items-center gap-sp-3 text-t-14 font-medium text-ilm-ink"
            >
              <RadioGroupItem id={`lvl-${lvl}`} value={lvl} />
              {LEVEL_LABELS[lvl]}
            </Label>
          ))}
        </RadioGroup>
      </Section>

      <Separator />

      <Section title="Narx">
        {PRICE_BUCKETS.map((b) => (
          <CheckRow
            key={b.id}
            id={`price-${b.id}`}
            label={b.label}
            checked={filters.price.includes(b.id)}
            onChange={() => onTogglePrice(b.id)}
          />
        ))}
      </Section>

      <Separator />

      <Section title="Reyting">
        <RadioGroup
          value={ratingValue}
          onValueChange={(v) => onSetRating(v === "__any" ? null : Number(v))}
        >
          <Label
            htmlFor="rt-any"
            className="flex cursor-pointer items-center gap-sp-3 text-t-14 font-medium text-ilm-ink"
          >
            <RadioGroupItem id="rt-any" value="__any" />
            Barchasi
          </Label>
          {RATING_OPTIONS.map((opt) => (
            <Label
              key={opt.value}
              htmlFor={`rt-${opt.value}`}
              className="flex cursor-pointer items-center gap-sp-3 text-t-14 font-medium text-ilm-ink"
            >
              <RadioGroupItem id={`rt-${opt.value}`} value={String(opt.value)} />
              {opt.label}
            </Label>
          ))}
        </RadioGroup>
      </Section>

      <Separator />

      <Section title="Davomiyligi">
        {DURATION_BUCKETS.map((b) => (
          <CheckRow
            key={b.id}
            id={`dur-${b.id}`}
            label={b.label}
            checked={filters.duration.includes(b.id)}
            onChange={() => onToggleDuration(b.id)}
          />
        ))}
      </Section>

      <Separator />

      <Section title="Til">
        {LANGUAGE_KEYS.map((lang) => (
          <CheckRow
            key={lang}
            id={`lang-${lang}`}
            label={LANGUAGE_LABELS[lang]}
            checked={filters.languages.includes(lang)}
            onChange={() => onToggleLanguage(lang)}
          />
        ))}
      </Section>
    </div>
  );
}
