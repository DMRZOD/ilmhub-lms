"use client";

import { useEffect, useId, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCurriculum } from "@/features/course-wizard/hooks";
import {
  LESSON_TYPES,
  LESSON_TYPE_LABELS,
  type LessonType,
  type WizardCourse,
  type WizardLesson,
  type WizardSection,
} from "@/features/course-wizard/schemas";
import { cn } from "@/lib/utils";
import { INPUT_CLASS } from "./field-styles";

function signature(sections: WizardSection[]) {
  return sections
    .map(
      (s) =>
        `${s.id}:${s.order}:${s.title}|` +
        s.lessons
          .map((l) => `${l.id}:${l.order}:${l.title}:${l.type}:${l.isPreview}`)
          .join(","),
    )
    .join(";");
}

export function StepCurriculum({ course }: { course: WizardCourse }) {
  const c = useCurriculum(course.id);
  const [sections, setSections] = useState<WizardSection[]>(course.sections);

  // Re-seed local state whenever the server tree changes (after any mutation).
  useEffect(() => {
    setSections(course.sections);
  }, [signature(course.sections)]); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onSectionDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(sections, oldIndex, newIndex);
    setSections(next);
    c.reorderSections.mutate(next.map((s) => s.id));
  };

  return (
    <div className="flex max-w-3xl flex-col gap-sp-4">
      <div className="flex items-center justify-between">
        <p className="text-t-14 text-fg-2">
          {course.sections.length} ta bo&apos;lim · {course.lessonsCount} ta dars
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onSectionDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-sp-3">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} ctrl={c} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <p className="rounded-ilm-xl border border-dashed border-ilm-border bg-ilm-surface px-sp-4 py-sp-6 text-center text-t-14 text-fg-3">
          Hali bo&apos;limlar yo&apos;q. Birinchi bo&apos;limni qo&apos;shing.
        </p>
      )}

      <Button
        type="button"
        variant="secondary"
        iconLeft={Plus}
        onClick={() => c.addSection.mutate("Yangi bo'lim")}
        disabled={c.addSection.isPending}
        className="self-start"
      >
        Bo&apos;lim qo&apos;shish
      </Button>
    </div>
  );
}

type Ctrl = ReturnType<typeof useCurriculum>;

function SectionCard({
  section,
  ctrl,
}: {
  section: WizardSection;
  ctrl: Ctrl;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-ilm-2xl border border-ilm-border bg-ilm-paper p-sp-3",
        isDragging && "opacity-60 shadow-ilm-md",
      )}
    >
      <div className="flex items-center gap-sp-2">
        <button
          type="button"
          aria-label="Ko'chirish"
          className="cursor-grab touch-none text-fg-3 hover:text-ilm-ink"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <input
          key={`${section.id}:${section.title}`}
          defaultValue={section.title}
          maxLength={160}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== section.title) {
              ctrl.renameSection.mutate({ sectionId: section.id, title: v });
            }
          }}
          className={cn(INPUT_CLASS, "font-semibold")}
        />
        <button
          type="button"
          aria-label="Bo'limni o'chirish"
          onClick={() => ctrl.removeSection.mutate(section.id)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-ilm-md text-fg-3 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-sp-3 pl-sp-6">
        <LessonList section={section} ctrl={ctrl} />
        <AddLessonForm sectionId={section.id} ctrl={ctrl} />
      </div>
    </div>
  );
}

function LessonList({ section, ctrl }: { section: WizardSection; ctrl: Ctrl }) {
  const [lessons, setLessons] = useState<WizardLesson[]>(section.lessons);
  useEffect(() => {
    setLessons(section.lessons);
  }, [signature([section])]); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(lessons, oldIndex, newIndex);
    setLessons(next);
    ctrl.reorderLessons.mutate({
      sectionId: section.id,
      orderedIds: next.map((l) => l.id),
    });
  };

  if (lessons.length === 0) {
    return (
      <p className="mb-sp-2 text-t-12 text-fg-3">Bu bo&apos;limda darslar yo&apos;q.</p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={lessons.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mb-sp-2 flex flex-col gap-sp-2">
          {lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} ctrl={ctrl} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function LessonRow({ lesson, ctrl }: { lesson: WizardLesson; ctrl: Ctrl }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-sp-2 rounded-ilm-xl border border-ilm-border bg-ilm-surface px-sp-2 py-sp-2",
        isDragging && "opacity-60",
      )}
    >
      <button
        type="button"
        aria-label="Ko'chirish"
        className="cursor-grab touch-none text-fg-3 hover:text-ilm-ink"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <input
        key={`${lesson.id}:${lesson.title}`}
        defaultValue={lesson.title}
        maxLength={200}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v && v !== lesson.title) {
            ctrl.updateLesson.mutate({
              lessonId: lesson.id,
              payload: { title: v },
            });
          }
        }}
        className={cn(INPUT_CLASS, "bg-ilm-paper")}
      />
      <select
        value={lesson.type}
        onChange={(e) =>
          ctrl.updateLesson.mutate({
            lessonId: lesson.id,
            payload: { type: e.target.value as LessonType },
          })
        }
        className="shrink-0 rounded-ilm-md border border-ilm-border bg-ilm-paper px-sp-2 py-1 text-t-12 text-ilm-ink outline-none"
      >
        {LESSON_TYPES.map((t) => (
          <option key={t} value={t}>
            {LESSON_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <label className="flex shrink-0 cursor-pointer items-center gap-1 text-t-12 text-fg-2">
        <input
          type="checkbox"
          checked={lesson.isPreview}
          onChange={(e) =>
            ctrl.updateLesson.mutate({
              lessonId: lesson.id,
              payload: { isPreview: e.target.checked },
            })
          }
        />
        Bepul
      </label>
      <button
        type="button"
        aria-label="Darsni o'chirish"
        onClick={() => ctrl.removeLesson.mutate(lesson.id)}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-ilm-md text-fg-3 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddLessonForm({ sectionId, ctrl }: { sectionId: string; ctrl: Ctrl }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<LessonType>("VIDEO");
  const fieldId = useId();

  const add = () => {
    const value = title.trim();
    if (!value) return;
    ctrl.addLesson.mutate({ sectionId, title: value, type });
    setTitle("");
  };

  return (
    <div className="flex items-center gap-sp-2">
      <input
        id={fieldId}
        value={title}
        placeholder="Yangi dars nomi"
        maxLength={200}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") add();
        }}
        className={cn(INPUT_CLASS, "py-1.5 text-t-14")}
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as LessonType)}
        className="shrink-0 rounded-ilm-md border border-ilm-border bg-ilm-paper px-sp-2 py-1 text-t-12 text-ilm-ink outline-none"
      >
        {LESSON_TYPES.map((t) => (
          <option key={t} value={t}>
            {LESSON_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        iconLeft={Plus}
        onClick={add}
        disabled={ctrl.addLesson.isPending}
        className="shrink-0"
      >
        Dars
      </Button>
    </div>
  );
}
