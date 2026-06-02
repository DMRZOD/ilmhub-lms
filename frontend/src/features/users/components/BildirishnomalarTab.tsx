"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/features/users/hooks";
import type { NotificationPreferences } from "@/features/users/api";

const TOGGLES: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  {
    key: "emailNewCourses",
    label: "Yangi kurslar",
    description: "Kuzatayotgan toifalarda yangi kurs chiqqanda xabar beriladi.",
  },
  {
    key: "emailNewLessons",
    label: "Yangi darslar haqida xabar berish",
    description: "Siz yozilgan kurslarda yangi dars qo'shilganda email keladi.",
  },
  {
    key: "emailQaReplies",
    label: "Q&A javoblari",
    description: "Sizning savolingizga instruktor yoki o'quvchi javob bersa xabar yuboriladi.",
  },
  {
    key: "emailReviewReplies",
    label: "Sharhga javob kelganda",
    description: "Sizning sharhingizga javob bo'lganda xabar yuboriladi.",
  },
  {
    key: "emailWeeklyDigest",
    label: "Haftalik xulosa",
    description: "Haftada bir marta o'quv jarayoni va tavsiyalar bo'yicha qisqacha xulosa.",
  },
  {
    key: "emailPromo",
    label: "Promo va chegirmalar",
    description: "IlmHub yangiliklari, chegirmalar va aksiyalar haqida xabar.",
  },
];

const DEFAULT_PREFS: NotificationPreferences = {
  emailNewCourses: true,
  emailNewLessons: true,
  emailQaReplies: true,
  emailReviewReplies: true,
  emailWeeklyDigest: false,
  emailPromo: false,
};

export function BildirishnomalarTab() {
  const { data: saved, isPending } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();
  const [state, setState] = useState<NotificationPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    if (saved) setState(saved);
  }, [saved]);

  const onSave = () => {
    update.mutate(state, {
      onSuccess: () => toast.success("Sozlamalar saqlandi"),
      onError: () => toast.error("Saqlashda xatolik"),
    });
  };

  if (isPending) {
    return (
      <div className="flex flex-col gap-sp-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-sp-4 py-sp-4">
            <Skeleton className="mt-1 h-4 w-4 rounded" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col divide-y divide-ilm-border">
        {TOGGLES.map((toggle) => (
          <label key={toggle.key} className="flex items-start gap-sp-4 py-sp-4">
            <Checkbox
              checked={state[toggle.key]}
              onCheckedChange={(checked) =>
                setState((s) => ({ ...s, [toggle.key]: checked === true }))
              }
              className="mt-1"
            />
            <div className="flex flex-col gap-1">
              <span className="text-t-14 font-semibold text-ilm-ink">
                {toggle.label}
              </span>
              <span className="text-t-12 text-fg-3">{toggle.description}</span>
            </div>
          </label>
        ))}
      </div>

      <Button
        type="button"
        size="md"
        className="self-start"
        onClick={onSave}
        disabled={update.isPending}
      >
        {update.isPending ? "Saqlanmoqda..." : "Saqlash"}
      </Button>
    </div>
  );
}
