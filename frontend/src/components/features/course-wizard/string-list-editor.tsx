"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { INPUT_CLASS, LABEL_CLASS } from "./field-styles";

export function StringListEditor({
  label,
  items,
  max = 10,
  placeholder,
  onChange,
}: {
  label: string;
  items: string[];
  max?: number;
  placeholder?: string;
  onChange: (value: string[]) => void;
}) {
  const update = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };
  const add = () => {
    if (items.length < max) onChange([...items, ""]);
  };
  const remove = (index: number) =>
    onChange(items.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-sp-2">
      <div className="flex items-center justify-between">
        <span className={LABEL_CLASS}>{label}</span>
        <span className="text-t-12 text-fg-3">
          {items.length}/{max}
        </span>
      </div>

      <div className="flex flex-col gap-sp-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-sp-2">
            <input
              value={item}
              placeholder={placeholder}
              onChange={(e) => update(index, e.target.value)}
              className={INPUT_CLASS}
            />
            <button
              type="button"
              aria-label="O'chirish"
              onClick={() => remove(index)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-ilm-md text-fg-3 transition hover:bg-ilm-surface hover:text-ilm-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-t-12 text-fg-3">Hozircha qo&apos;shilmagan.</p>
        )}
      </div>

      {items.length < max && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          iconLeft={Plus}
          onClick={add}
          className="self-start"
        >
          Qo&apos;shish
        </Button>
      )}
    </div>
  );
}
