import { Prisma, QuizQuestion, QuizQuestionType } from '@prisma/client';

export interface QuizOption {
  id: string;
  text: string;
}

/** Safely coerce the Json `options` column into a typed array. */
export function parseOptions(value: Prisma.JsonValue | null): QuizOption[] {
  if (!Array.isArray(value)) return [];
  const out: QuizOption[] = [];
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      continue;
    }
    const record = entry as Record<string, unknown>;
    const id = String(record.id ?? '');
    if (id.length === 0) continue;
    out.push({ id, text: String(record.text ?? '') });
  }
  return out;
}

/** Public shape sent to learners — never includes correct answers/explanation. */
export function toPublicQuestion(q: QuizQuestion) {
  return {
    id: q.id,
    type: q.type,
    text: q.text,
    options: q.type === QuizQuestionType.TEXT ? [] : parseOptions(q.options),
    order: q.order,
  };
}

export type PublicQuestion = ReturnType<typeof toPublicQuestion>;
