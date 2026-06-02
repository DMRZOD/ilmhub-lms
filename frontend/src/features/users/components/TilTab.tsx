"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
  { value: "uz", label: "O'zbekcha" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
] as const;

type LangValue = (typeof LANGUAGES)[number]["value"];

const STORAGE_KEY = "ilmhub:lang";
const DEFAULT_LANG: LangValue = "uz";

function isLang(value: string): value is LangValue {
  return LANGUAGES.some((l) => l.value === value);
}

export function TilTab() {
  const [lang, setLang] = useState<LangValue>(DEFAULT_LANG);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isLang(stored)) setLang(stored);
  }, []);

  const onSave = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
    toast.success("Til tanlovi saqlandi");
  };

  return (
    <div className="flex flex-col gap-sp-6">
      <p className="rounded-ilm-md border border-ilm-border bg-ilm-surface px-sp-4 py-sp-3 text-t-12 text-fg-2">
        Hozircha tanlov faqat ko&apos;rinishda — to&apos;liq i18n keyingi qadamda ulanadi.
      </p>

      <div className="flex flex-col gap-sp-2">
        <label
          htmlFor="lang-select"
          className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2"
        >
          Interfeys tili
        </label>
        <Select value={lang} onValueChange={(v) => setLang(v as LangValue)}>
          <SelectTrigger id="lang-select" className="max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="button" size="md" className="self-start" onClick={onSave}>
        Saqlash
      </Button>
    </div>
  );
}
