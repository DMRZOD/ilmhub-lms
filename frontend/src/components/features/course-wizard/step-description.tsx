"use client";

import { useState } from "react";

import { RichTextEditor } from "@/components/features/notes/rich-text-editor";
import type { UpdateCoursePayload } from "@/features/course-wizard/api";
import type { WizardCourse } from "@/features/course-wizard/schemas";
import { INPUT_CLASS, LABEL_CLASS } from "./field-styles";
import { StringListEditor } from "./string-list-editor";

export function StepDescription({
  course,
  save,
}: {
  course: WizardCourse;
  save: (payload: UpdateCoursePayload) => void;
}) {
  const [description, setDescription] = useState(course.description);
  const [outcomes, setOutcomes] = useState<string[]>(course.learningOutcomes);
  const [requirements, setRequirements] = useState<string[]>(
    course.requirements,
  );

  return (
    <div className="flex max-w-2xl flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-2">
        <label className={LABEL_CLASS}>Qisqa tavsif</label>
        <textarea
          value={description}
          rows={4}
          maxLength={2000}
          placeholder="Kurs nima haqida ekanini qisqacha yozing"
          onChange={(e) => {
            setDescription(e.target.value);
            save({ description: e.target.value });
          }}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-sp-2">
        <label className={LABEL_CLASS}>To&apos;liq tavsif</label>
        <RichTextEditor
          initialContent={course.longDescription ?? ""}
          placeholder="Kurs dasturi, kimlar uchun mosligi va boshqalar..."
          onChange={(html) => save({ longDescription: html })}
        />
      </div>

      <StringListEditor
        label="Nimalarni o'rganadilar"
        items={outcomes}
        max={10}
        placeholder="Masalan: React komponentlarini yaratish"
        onChange={(v) => {
          setOutcomes(v);
          save({ learningOutcomes: v.filter((s) => s.trim().length > 0) });
        }}
      />

      <StringListEditor
        label="Talablar"
        items={requirements}
        max={10}
        placeholder="Masalan: JavaScript asoslari"
        onChange={(v) => {
          setRequirements(v);
          save({ requirements: v.filter((s) => s.trim().length > 0) });
        }}
      />
    </div>
  );
}
