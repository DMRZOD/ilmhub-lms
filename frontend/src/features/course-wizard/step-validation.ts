import { z } from "zod";

import {
  courseLanguageSchema,
  courseLevelSchema,
  type WizardCourse,
} from "./schemas";

/**
 * Per-step Zod schemas. The wizard validates the current step against its
 * schema and blocks "Keyingisi" until it passes (roadmap Шаг 29 §5).
 * Each schema reads the relevant slice of the WizardCourse object.
 */

export const step1Schema = z.object({
  title: z.string().trim().min(1, "Kurs nomini kiriting").max(160),
  subtitle: z.string().max(240).nullable().optional(),
  categoryId: z.string().min(1, "Kategoriyani tanlang"),
  level: courseLevelSchema,
  language: courseLanguageSchema,
  priceUsdCents: z.number().int().min(0, "Narx manfiy bo'lishi mumkin emas"),
});

export const step2Schema = z.object({
  thumbnailUrl: z
    .string({ message: "Kurs muqovasini yuklang" })
    .url("Kurs muqovasini yuklang"),
});

export const step3Schema = z.object({
  description: z.string().trim().min(1, "Qisqa tavsifni kiriting").max(2000),
  longDescription: z.string().max(20000).nullable().optional(),
  learningOutcomes: z
    .array(z.string())
    .max(10, "Ko'pi bilan 10 ta natija"),
  requirements: z.array(z.string()).max(10, "Ko'pi bilan 10 ta talab"),
});

export const step4Schema = z.object({
  sections: z
    .array(z.object({ lessons: z.array(z.unknown()) }))
    .min(1, "Kamida bitta bo'lim qo'shing"),
});

const STEP_SCHEMAS: Record<number, z.ZodType> = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
};

export type StepValidation = { ok: boolean; message?: string };

export function validateStep(
  step: number,
  course: WizardCourse,
): StepValidation {
  const schema = STEP_SCHEMAS[step];
  if (!schema) return { ok: true };
  const result = schema.safeParse(course);
  if (result.success) return { ok: true };
  return { ok: false, message: result.error.issues[0]?.message };
}
