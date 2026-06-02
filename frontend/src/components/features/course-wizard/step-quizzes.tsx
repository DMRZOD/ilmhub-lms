"use client";

import { useEffect, useState } from "react";
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
import { Check, GripVertical, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLessonAuthoring } from "@/features/course-wizard/hooks";
import {
  QUIZ_QUESTION_TYPES,
  QUIZ_QUESTION_TYPE_LABELS,
  type QuizOption,
  type QuizQuestionType,
  type WizardCourse,
  type WizardLesson,
  type WizardQuizQuestion,
} from "@/features/course-wizard/schemas";
import { cn } from "@/lib/utils";
import { INPUT_CLASS, LABEL_CLASS } from "./field-styles";
import { lessonsOfType } from "./step-helpers";

type Auth = ReturnType<typeof useLessonAuthoring>;

const newOptionId = () => Math.random().toString(36).slice(2, 10);

export function StepQuizzes({ course }: { course: WizardCourse }) {
  const auth = useLessonAuthoring(course.id);
  const lessons = lessonsOfType(course, "QUIZ");

  if (lessons.length === 0) {
    return (
      <p className="rounded-ilm-xl border border-dashed border-ilm-border bg-ilm-surface px-sp-4 py-sp-6 text-center text-t-14 text-fg-3">
        Test darslari yo&apos;q. «Dastur» bosqichida turi «Test» bo&apos;lgan
        dars qo&apos;shing.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-sp-6">
      <p className="text-t-14 text-fg-2">
        Har bir test uchun o&apos;tish balli, urinishlar soni va savollarni
        sozlang.
      </p>
      {lessons.map(({ lesson, sectionTitle }) => (
        <QuizCard
          key={lesson.id}
          lesson={lesson}
          sectionTitle={sectionTitle}
          auth={auth}
        />
      ))}
    </div>
  );
}

function QuizCard({
  lesson,
  sectionTitle,
  auth,
}: {
  lesson: WizardLesson;
  sectionTitle: string;
  auth: Auth;
}) {
  const quiz = lesson.quiz;
  const [passingScore, setPassingScore] = useState(quiz?.passingScore ?? 70);
  const [attemptsAllowed, setAttemptsAllowed] = useState(
    quiz?.attemptsAllowed ?? 3,
  );

  const saveSettings = () =>
    auth.upsertQuiz.mutate({
      lessonId: lesson.id,
      settings: {
        passingScore: clamp(passingScore, 0, 100),
        attemptsAllowed: clamp(attemptsAllowed, 0, 100),
      },
    });

  const serverQuestions = quiz?.questions ?? [];
  const [items, setItems] = useState<WizardQuizQuestion[]>(serverQuestions);
  useEffect(() => {
    setItems(serverQuestions);
  }, [questionsSignature(serverQuestions)]); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((q) => q.id === active.id);
    const newIndex = items.findIndex((q) => q.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    auth.reorderQuestions.mutate({
      lessonId: lesson.id,
      orderedIds: next.map((q) => q.id),
    });
  };

  const addQuestion = () =>
    auth.addQuestion.mutate({
      lessonId: lesson.id,
      payload: {
        type: "SINGLE",
        text: "",
        options: [
          { id: newOptionId(), text: "" },
          { id: newOptionId(), text: "" },
        ],
        correctAnswerIds: [],
      },
    });

  return (
    <div className="flex flex-col gap-sp-4 rounded-ilm-2xl border border-ilm-border bg-ilm-paper p-sp-4">
      <div className="flex flex-wrap items-center justify-between gap-sp-2">
        <div className="flex flex-col">
          <span className="text-t-14 font-semibold text-ilm-ink">
            {lesson.title}
          </span>
          <span className="text-t-12 text-fg-3">{sectionTitle}</span>
        </div>
        <Badge tone="neutral">Test</Badge>
      </div>

      <div className="flex flex-wrap gap-sp-4">
        <label className="flex flex-col gap-1">
          <span className={cn(LABEL_CLASS, "text-t-12")}>O&apos;tish balli (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            onBlur={saveSettings}
            className={cn(INPUT_CLASS, "w-28 py-1.5 text-t-14")}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={cn(LABEL_CLASS, "text-t-12")}>
            Urinishlar (0 = cheksiz)
          </span>
          <input
            type="number"
            min={0}
            max={100}
            value={attemptsAllowed}
            onChange={(e) => setAttemptsAllowed(Number(e.target.value))}
            onBlur={saveSettings}
            className={cn(INPUT_CLASS, "w-28 py-1.5 text-t-14")}
          />
        </label>
      </div>

      <div className="flex flex-col gap-sp-3 border-t border-ilm-border pt-sp-3">
        {items.length === 0 ? (
          <p className="text-t-12 text-fg-3">Hali savollar yo&apos;q.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={items.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-sp-3">
                {items.map((q, i) => (
                  <QuestionEditor
                    key={q.id}
                    index={i}
                    question={q}
                    auth={auth}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          iconLeft={Plus}
          onClick={addQuestion}
          disabled={auth.addQuestion.isPending}
          className="self-start"
        >
          Savol qo&apos;shish
        </Button>
      </div>
    </div>
  );
}

function QuestionEditor({
  index,
  question,
  auth,
}: {
  index: number;
  question: WizardQuizQuestion;
  auth: Auth;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id });

  const [type, setType] = useState<QuizQuestionType>(question.type);
  const [text, setText] = useState(question.text);
  const [options, setOptions] = useState<QuizOption[]>(question.options);
  const [correct, setCorrect] = useState<string[]>(question.correctAnswerIds);
  const [explanation, setExplanation] = useState(question.explanation ?? "");

  const changeType = (next: QuizQuestionType) => {
    setType(next);
    setCorrect([]);
    if (next === "TEXT") {
      // For TEXT, correctAnswerIds holds accepted answer strings.
      if (correct.length === 0) setCorrect([""]);
    } else if (options.length === 0) {
      setOptions([
        { id: newOptionId(), text: "" },
        { id: newOptionId(), text: "" },
      ]);
    }
  };

  const toggleCorrect = (optionId: string) => {
    if (type === "SINGLE") setCorrect([optionId]);
    else
      setCorrect(
        correct.includes(optionId)
          ? correct.filter((id) => id !== optionId)
          : [...correct, optionId],
      );
  };

  const save = () => {
    const payload = {
      type,
      text,
      options: type === "TEXT" ? [] : options.filter((o) => o.text.trim()),
      correctAnswerIds:
        type === "TEXT"
          ? correct.filter((c) => c.trim())
          : correct.filter((id) => options.some((o) => o.id === id)),
      explanation,
    };
    auth.updateQuestion.mutate(
      { questionId: question.id, payload },
      {
        onSuccess: () => toast.success("Savol saqlandi"),
        onError: () => toast.error("Saqlab bo'lmadi"),
      },
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex flex-col gap-sp-3 rounded-ilm-xl border border-ilm-border bg-ilm-surface p-sp-3",
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
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-t-12 font-bold text-fg-3">{index + 1}.</span>
        <select
          value={type}
          onChange={(e) => changeType(e.target.value as QuizQuestionType)}
          className="rounded-ilm-md border border-ilm-border bg-ilm-paper px-sp-2 py-1 text-t-12 text-ilm-ink outline-none"
        >
          {QUIZ_QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {QUIZ_QUESTION_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-label="Savolni o'chirish"
          onClick={() => auth.removeQuestion.mutate(question.id)}
          className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-ilm-md text-fg-3 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <textarea
        value={text}
        rows={2}
        placeholder="Savol matni"
        onChange={(e) => setText(e.target.value)}
        className={cn(INPUT_CLASS, "bg-ilm-paper text-t-14")}
      />

      {type === "TEXT" ? (
        <div className="flex flex-col gap-sp-2">
          <span className={cn(LABEL_CLASS, "text-t-12")}>
            Qabul qilinadigan javoblar
          </span>
          {correct.map((ans, i) => (
            <div key={i} className="flex items-center gap-sp-2">
              <input
                value={ans}
                placeholder="To'g'ri javob"
                onChange={(e) =>
                  setCorrect(
                    correct.map((c, idx) => (idx === i ? e.target.value : c)),
                  )
                }
                className={cn(INPUT_CLASS, "bg-ilm-paper py-1.5 text-t-14")}
              />
              <button
                type="button"
                aria-label="O'chirish"
                onClick={() => setCorrect(correct.filter((_, idx) => idx !== i))}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-ilm-md text-fg-3 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconLeft={Plus}
            onClick={() => setCorrect([...correct, ""])}
            className="self-start"
          >
            Javob qo&apos;shish
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-sp-2">
          <span className={cn(LABEL_CLASS, "text-t-12")}>
            Variantlar — to&apos;g&apos;risini belgilang
          </span>
          {options.map((o, i) => {
            const isCorrect = correct.includes(o.id);
            return (
              <div key={o.id} className="flex items-center gap-sp-2">
                <button
                  type="button"
                  aria-label="To'g'ri javob"
                  aria-pressed={isCorrect}
                  onClick={() => toggleCorrect(o.id)}
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-ilm-md border transition",
                    type === "SINGLE" ? "rounded-ilm-full" : "rounded-ilm-md",
                    isCorrect
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-ilm-border bg-ilm-paper text-transparent hover:border-ilm-ink",
                  )}
                >
                  <Check className="h-4 w-4" />
                </button>
                <input
                  value={o.text}
                  placeholder={`Variant ${i + 1}`}
                  onChange={(e) =>
                    setOptions(
                      options.map((opt, idx) =>
                        idx === i ? { ...opt, text: e.target.value } : opt,
                      ),
                    )
                  }
                  className={cn(INPUT_CLASS, "bg-ilm-paper py-1.5 text-t-14")}
                />
                <button
                  type="button"
                  aria-label="Variantni o'chirish"
                  onClick={() => {
                    setOptions(options.filter((_, idx) => idx !== i));
                    setCorrect(correct.filter((id) => id !== o.id));
                  }}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-ilm-md text-fg-3 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          {options.length < 12 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              iconLeft={Plus}
              onClick={() =>
                setOptions([...options, { id: newOptionId(), text: "" }])
              }
              className="self-start"
            >
              Variant qo&apos;shish
            </Button>
          )}
        </div>
      )}

      <input
        value={explanation}
        placeholder="Izoh (ixtiyoriy) — javobdan keyin ko'rsatiladi"
        maxLength={2000}
        onChange={(e) => setExplanation(e.target.value)}
        className={cn(INPUT_CLASS, "bg-ilm-paper py-1.5 text-t-12")}
      />

      <Button
        type="button"
        size="sm"
        iconLeft={Save}
        onClick={save}
        disabled={auth.updateQuestion.isPending}
        className="self-start"
      >
        Savolni saqlash
      </Button>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

function questionsSignature(qs: WizardQuizQuestion[]) {
  return qs.map((q) => `${q.id}:${q.order}`).join(",");
}
