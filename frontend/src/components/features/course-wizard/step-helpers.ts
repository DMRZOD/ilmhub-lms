import { useEffect, useRef } from "react";

import type {
  LessonType,
  WizardCourse,
  WizardLesson,
} from "@/features/course-wizard/schemas";

export interface LessonWithSection {
  lesson: WizardLesson;
  sectionTitle: string;
  sectionOrder: number;
}

/** Flatten the curriculum to the lessons of one type, keeping section context. */
export function lessonsOfType(
  course: WizardCourse,
  type: LessonType,
): LessonWithSection[] {
  return course.sections.flatMap((section) =>
    section.lessons
      .filter((lesson) => lesson.type === type)
      .map((lesson) => ({
        lesson,
        sectionTitle: section.title,
        sectionOrder: section.order,
      })),
  );
}

/** Returns a debounced version of `fn` (default 600ms) stable for the component. */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay = 600,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (...args: A) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fnRef.current(...args), delay);
  };
}
