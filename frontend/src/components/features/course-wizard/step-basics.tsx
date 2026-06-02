"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { UpdateCoursePayload } from "@/features/course-wizard/api";
import {
  COURSE_LANGUAGES,
  COURSE_LANGUAGE_LABELS,
  COURSE_LEVELS,
  COURSE_LEVEL_LABELS,
  type WizardCourse,
} from "@/features/course-wizard/schemas";
import { HINT_CLASS, INPUT_CLASS, LABEL_CLASS } from "./field-styles";

type Category = { id: string; name: string };

function useCategories() {
  return useQuery({
    queryKey: ["wizard-categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data } = await api.get("/categories");
      const list = Array.isArray(data) ? data : (data?.items ?? []);
      return list as Category[];
    },
    staleTime: 5 * 60_000,
  });
}

export function StepBasics({
  course,
  save,
}: {
  course: WizardCourse;
  save: (payload: UpdateCoursePayload) => void;
}) {
  const categories = useCategories();
  const [title, setTitle] = useState(course.title);
  const [subtitle, setSubtitle] = useState(course.subtitle ?? "");
  const [categoryId, setCategoryId] = useState(course.categoryId);
  const [level, setLevel] = useState(course.level);
  const [language, setLanguage] = useState(course.language);
  const [price, setPrice] = useState((course.priceUsdCents / 100).toString());

  const onPrice = (raw: string) => {
    setPrice(raw);
    const dollars = parseFloat(raw);
    if (Number.isFinite(dollars) && dollars >= 0) {
      save({ priceUsdCents: Math.round(dollars * 100) });
    } else if (raw.trim() === "") {
      save({ priceUsdCents: 0 });
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-sp-5">
      <div className="flex flex-col gap-sp-2">
        <label className={LABEL_CLASS}>Kurs nomi</label>
        <input
          value={title}
          placeholder="Masalan: React.js 0 dan professional darajagacha"
          maxLength={160}
          onChange={(e) => {
            setTitle(e.target.value);
            save({ title: e.target.value });
          }}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-sp-2">
        <label className={LABEL_CLASS}>Qisqa tavsif (subtitle)</label>
        <input
          value={subtitle}
          placeholder="Bir jumlada kurs haqida"
          maxLength={240}
          onChange={(e) => {
            setSubtitle(e.target.value);
            save({ subtitle: e.target.value });
          }}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-sp-2">
        <label className={LABEL_CLASS}>Kategoriya</label>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            save({ categoryId: e.target.value });
          }}
          className={INPUT_CLASS}
        >
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-sp-4 sm:grid-cols-2">
        <div className="flex flex-col gap-sp-2">
          <label className={LABEL_CLASS}>Daraja</label>
          <select
            value={level}
            onChange={(e) => {
              const v = e.target.value as WizardCourse["level"];
              setLevel(v);
              save({ level: v });
            }}
            className={INPUT_CLASS}
          >
            {COURSE_LEVELS.map((l) => (
              <option key={l} value={l}>
                {COURSE_LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-sp-2">
          <label className={LABEL_CLASS}>Til</label>
          <select
            value={language}
            onChange={(e) => {
              const v = e.target.value as WizardCourse["language"];
              setLanguage(v);
              save({ language: v });
            }}
            className={INPUT_CLASS}
          >
            {COURSE_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {COURSE_LANGUAGE_LABELS[l]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-sp-2">
        <label className={LABEL_CLASS}>Narx (USD)</label>
        <input
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => onPrice(e.target.value)}
          className={INPUT_CLASS}
        />
        <span className={HINT_CLASS}>0 = bepul kurs</span>
      </div>
    </div>
  );
}
