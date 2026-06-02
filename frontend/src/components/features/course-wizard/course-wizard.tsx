"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useCourseAutosave,
  useWizardCourse,
} from "@/features/course-wizard/hooks";
import { SaveIndicator } from "./save-indicator";
import { StepBasics } from "./step-basics";
import { StepThumbnail } from "./step-thumbnail";
import { StepDescription } from "./step-description";
import { StepCurriculum } from "./step-curriculum";
import { StepLessons } from "./step-lessons";
import { StepCoding } from "./step-coding";
import { StepQuizzes } from "./step-quizzes";
import { StepPublish } from "./step-publish";
import { MAX_ENABLED_STEP, WizardStepper } from "./wizard-stepper";
import { validateStep } from "@/features/course-wizard/step-validation";

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export function CourseWizard({ courseId }: { courseId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const { data: course, isLoading, isError } = useWizardCourse(courseId);
  const { save, status } = useCourseAutosave(courseId);

  const step = clamp(Number(params.get("step") ?? "1") || 1, 1, MAX_ENABLED_STEP);
  const goto = (s: number) =>
    router.replace(`/instructor/courses/${courseId}/edit?step=${s}`);

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-ilm-ink" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <Card padding="lg">
        <h3 className="text-t-16 font-bold text-ilm-ink">
          Kursni yuklab bo&apos;lmadi
        </h3>
        <p className="text-t-14 text-fg-2">
          Iltimos, sahifani yangilang yoki keyinroq urinib ko&apos;ring.
        </p>
        <Button asChild variant="secondary" size="sm" className="mt-sp-3">
          <Link href="/instructor/courses">Kurslarim</Link>
        </Button>
      </Card>
    );
  }

  const { ok: proceed, message: blockHint } = validateStep(step, course);

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-3">
        <Link
          href="/instructor/courses"
          className="inline-flex items-center gap-1 text-t-12 text-fg-3 hover:text-ilm-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kurslarim
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-sp-3">
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            {course.title.trim() || "Yangi kurs"}
          </h1>
          <SaveIndicator status={status} />
        </div>
      </div>

      <WizardStepper current={step} onSelect={goto} />

      <Card padding="lg">
        {step === 1 && <StepBasics course={course} save={save} />}
        {step === 2 && <StepThumbnail course={course} save={save} />}
        {step === 3 && <StepDescription course={course} save={save} />}
        {step === 4 && <StepCurriculum course={course} />}
        {step === 5 && <StepLessons course={course} />}
        {step === 6 && <StepCoding course={course} />}
        {step === 7 && <StepQuizzes course={course} />}
        {step === 8 && <StepPublish course={course} />}
      </Card>

      <div className="flex flex-col gap-sp-2">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            iconLeft={ArrowLeft}
            disabled={step <= 1}
            onClick={() => goto(step - 1)}
          >
            Orqaga
          </Button>

          {step < MAX_ENABLED_STEP && (
            <Button
              type="button"
              iconRight={ArrowRight}
              disabled={!proceed}
              onClick={() => proceed && goto(step + 1)}
            >
              Keyingisi
            </Button>
          )}
        </div>
        {!proceed && blockHint && (
          <p className="text-right text-t-12 text-amber-600">{blockHint}</p>
        )}
      </div>
    </div>
  );
}
