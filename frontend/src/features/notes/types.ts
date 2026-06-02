import { z } from "zod";

export const noteLessonInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number().int(),
  section: z.object({
    id: z.string(),
    title: z.string(),
    order: z.number().int(),
  }),
});
export type NoteLessonInfo = z.infer<typeof noteLessonInfoSchema>;

export const noteSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  content: z.string(),
  timestampSeconds: z.number().int().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lesson: noteLessonInfoSchema.nullable().optional(),
});
export type Note = z.infer<typeof noteSchema>;

export const notesResponseSchema = z.array(noteSchema);

export interface CreateNoteInput {
  lessonId: string;
  content: string;
  timestampSeconds?: number | null;
}

export interface UpdateNoteInput {
  content?: string;
  timestampSeconds?: number | null;
}

export type NoteSort = "timestamp" | "recent";
