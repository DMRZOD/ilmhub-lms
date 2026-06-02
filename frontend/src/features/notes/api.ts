import { api } from "@/lib/api-client";

import {
  noteSchema,
  notesResponseSchema,
  type CreateNoteInput,
  type Note,
  type UpdateNoteInput,
} from "./types";

export async function fetchLessonNotes(lessonId: string): Promise<Note[]> {
  const { data } = await api.get("/notes", { params: { lessonId } });
  return notesResponseSchema.parse(data);
}

export async function fetchCourseNotes(courseId: string): Promise<Note[]> {
  const { data } = await api.get("/notes", { params: { courseId } });
  return notesResponseSchema.parse(data);
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const { data } = await api.post("/notes", input);
  return noteSchema.parse(data);
}

export async function updateNote(
  id: string,
  input: UpdateNoteInput,
): Promise<Note> {
  const { data } = await api.patch(`/notes/${encodeURIComponent(id)}`, input);
  return noteSchema.parse(data);
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete(`/notes/${encodeURIComponent(id)}`);
}
