"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLessonAuthoring } from "@/features/course-wizard/hooks";
import {
  CODING_LANGUAGE_LABELS,
  CODING_LANGUAGE_MONACO,
  WIZARD_CODING_LANGUAGES,
  type CodingLanguage,
  type CodingTest,
  type WizardCourse,
  type WizardLesson,
} from "@/features/course-wizard/schemas";
import { cn } from "@/lib/utils";
import { CodeEditor } from "./code-editor";
import { INPUT_CLASS, LABEL_CLASS } from "./field-styles";
import { lessonsOfType } from "./step-helpers";

type Auth = ReturnType<typeof useLessonAuthoring>;

export function StepCoding({ course }: { course: WizardCourse }) {
  const auth = useLessonAuthoring(course.id);
  const lessons = lessonsOfType(course, "CODING");

  if (lessons.length === 0) {
    return (
      <p className="rounded-ilm-xl border border-dashed border-ilm-border bg-ilm-surface px-sp-4 py-sp-6 text-center text-t-14 text-fg-3">
        Kod mashqi darslari yo&apos;q. «Dastur» bosqichida turi «Kod mashqi»
        bo&apos;lgan dars qo&apos;shing.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-sp-6">
      <p className="text-t-14 text-fg-2">
        Har bir kod mashqi uchun til, boshlang&apos;ich kod, yechim va testlarni
        kiriting.
      </p>
      {lessons.map(({ lesson, sectionTitle }) => (
        <CodingCard
          key={lesson.id}
          lesson={lesson}
          sectionTitle={sectionTitle}
          auth={auth}
        />
      ))}
    </div>
  );
}

function CodingCard({
  lesson,
  sectionTitle,
  auth,
}: {
  lesson: WizardLesson;
  sectionTitle: string;
  auth: Auth;
}) {
  const initial = lesson.coding;
  // Only JS/TS are auto-gradable; coerce any legacy language to JS for editing.
  const [language, setLanguage] = useState<CodingLanguage>(
    initial?.language === "TS" ? "TS" : "JS",
  );
  const [entryFunction, setEntryFunction] = useState(
    initial?.entryFunction ?? "",
  );
  const [starterCode, setStarterCode] = useState(initial?.starterCode ?? "");
  const [solutionCode, setSolutionCode] = useState(initial?.solutionCode ?? "");
  const [tests, setTests] = useState<CodingTest[]>(initial?.tests ?? []);

  const monacoLang = CODING_LANGUAGE_MONACO[language];

  const onSave = () => {
    if (entryFunction.trim() === "") {
      toast.error("Funksiya nomini kiriting");
      return;
    }
    const cleaned = tests.filter(
      (t) =>
        t.input.trim() !== "" ||
        t.expectedOutput.trim() !== "" ||
        (t.description ?? "").trim() !== "",
    );
    auth.upsertCoding.mutate(
      {
        lessonId: lesson.id,
        payload: {
          language,
          entryFunction: entryFunction.trim(),
          starterCode,
          solutionCode,
          tests: cleaned,
        },
      },
      {
        onSuccess: () => toast.success("Kod mashqi saqlandi"),
        onError: () => toast.error("Saqlab bo'lmadi"),
      },
    );
  };

  const updateTest = (i: number, patch: Partial<CodingTest>) =>
    setTests(tests.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));

  return (
    <div className="flex flex-col gap-sp-4 rounded-ilm-2xl border border-ilm-border bg-ilm-paper p-sp-4">
      <div className="flex flex-wrap items-center justify-between gap-sp-2">
        <div className="flex flex-col">
          <span className="text-t-14 font-semibold text-ilm-ink">
            {lesson.title}
          </span>
          <span className="text-t-12 text-fg-3">{sectionTitle}</span>
        </div>
        <div className="flex items-center gap-sp-2">
          <Badge tone="neutral">Kod mashqi</Badge>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as CodingLanguage)}
            className="rounded-ilm-md border border-ilm-border bg-ilm-paper px-sp-2 py-1 text-t-12 text-ilm-ink outline-none"
          >
            {WIZARD_CODING_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {CODING_LANGUAGE_LABELS[l]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-sp-2">
        <label className={cn(LABEL_CLASS, "text-t-12")}>
          Funksiya nomi (testlar shu funksiyani chaqiradi)
        </label>
        <input
          value={entryFunction}
          placeholder="masalan: add"
          maxLength={120}
          onChange={(e) => setEntryFunction(e.target.value)}
          className={cn(INPUT_CLASS, "py-1.5 font-mono text-t-12 sm:max-w-xs")}
        />
      </div>

      <div className="grid gap-sp-4 lg:grid-cols-2">
        <div className="flex flex-col gap-sp-2">
          <label className={cn(LABEL_CLASS, "text-t-12")}>
            Boshlang&apos;ich kod
          </label>
          <CodeEditor
            value={starterCode}
            language={monacoLang}
            onChange={setStarterCode}
            height="220px"
          />
        </div>
        <div className="flex flex-col gap-sp-2">
          <label className={cn(LABEL_CLASS, "text-t-12")}>Yechim kodi</label>
          <CodeEditor
            value={solutionCode}
            language={monacoLang}
            onChange={setSolutionCode}
            height="220px"
          />
        </div>
      </div>

      <div className="flex flex-col gap-sp-2">
        <span className={cn(LABEL_CLASS, "text-t-12")}>Testlar</span>
        <p className="text-t-12 text-fg-3">
          Argumentlar — JSON massiv (masalan{" "}
          <code className="font-mono">[2, 3]</code> yoki{" "}
          <code className="font-mono">[[1, 2, 3]]</code> bitta massiv argument
          uchun). Natija qiymat sifatida solishtiriladi (masalan{" "}
          <code className="font-mono">5</code> yoki{" "}
          <code className="font-mono">[1, 2, 3]</code>).
        </p>
        {tests.length === 0 && (
          <p className="text-t-12 text-fg-3">
            Hozircha test yo&apos;q. Kamida bitta test qo&apos;shing.
          </p>
        )}
        {tests.map((t, i) => (
          <div
            key={i}
            className="flex flex-col gap-sp-2 rounded-ilm-xl border border-ilm-border bg-ilm-surface p-sp-3"
          >
            <div className="grid gap-sp-2 sm:grid-cols-2">
              <textarea
                value={t.input}
                rows={2}
                placeholder="Argumentlar (JSON), masalan: [2, 3]"
                onChange={(e) => updateTest(i, { input: e.target.value })}
                className={cn(INPUT_CLASS, "font-mono text-t-12")}
              />
              <textarea
                value={t.expectedOutput}
                rows={2}
                placeholder="Kutilgan natija, masalan: 5"
                onChange={(e) =>
                  updateTest(i, { expectedOutput: e.target.value })
                }
                className={cn(INPUT_CLASS, "font-mono text-t-12")}
              />
            </div>
            <div className="flex items-center gap-sp-2">
              <input
                value={t.description ?? ""}
                placeholder="Izoh (ixtiyoriy)"
                maxLength={500}
                onChange={(e) => updateTest(i, { description: e.target.value })}
                className={cn(INPUT_CLASS, "py-1.5 text-t-12")}
              />
              <div className="flex shrink-0 flex-col items-center gap-0.5">
                <label className="text-t-11 text-fg-3">Вес</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={t.weight ?? 1}
                  onChange={(e) =>
                    updateTest(i, {
                      weight: Math.min(
                        10,
                        Math.max(1, parseInt(e.target.value) || 1),
                      ),
                    })
                  }
                  className={cn(INPUT_CLASS, "w-14 py-1.5 text-center text-t-12")}
                />
              </div>
              <button
                type="button"
                aria-label="Testni o'chirish"
                onClick={() => setTests(tests.filter((_, idx) => idx !== i))}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-ilm-md text-fg-3 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {tests.length < 50 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconLeft={Plus}
            onClick={() =>
              setTests([
                ...tests,
                { input: "", expectedOutput: "", description: "", weight: 1 },
              ])
            }
            className="self-start"
          >
            Test qo&apos;shish
          </Button>
        )}
      </div>

      <Button
        type="button"
        iconLeft={Save}
        onClick={onSave}
        disabled={auth.upsertCoding.isPending}
        className="self-start"
      >
        Saqlash
      </Button>
    </div>
  );
}
