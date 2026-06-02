"use client";

import { CheckCircle2, NotebookPen } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  completed: boolean;
  isSubmitting: boolean;
  onComplete: () => void;
}

export function LessonActions({ completed, isSubmitting, onComplete }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-sp-3">
      <Button
        variant="primary"
        size="md"
        iconLeft={CheckCircle2}
        onClick={onComplete}
        disabled={isSubmitting || completed}
      >
        {completed ? "Tugatildi" : "Tugatdim"}
      </Button>
      <Button
        variant="secondary"
        size="md"
        iconLeft={NotebookPen}
        disabled
        title="Keyingi qadamda qo'shiladi"
      >
        Eslatma qo&apos;shish
      </Button>
    </div>
  );
}
