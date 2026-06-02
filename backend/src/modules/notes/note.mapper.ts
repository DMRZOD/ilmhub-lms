export interface NoteLessonInfo {
  id: string;
  title: string;
  order: number;
  section: { id: string; title: string; order: number };
}

export interface NoteRow {
  id: string;
  lessonId: string;
  content: string;
  timestampSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
  lesson?: NoteLessonInfo | null;
}

export function toNoteDto(row: NoteRow) {
  return {
    id: row.id,
    lessonId: row.lessonId,
    content: row.content,
    timestampSeconds: row.timestampSeconds,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    lesson: row.lesson
      ? {
          id: row.lesson.id,
          title: row.lesson.title,
          order: row.lesson.order,
          section: {
            id: row.lesson.section.id,
            title: row.lesson.section.title,
            order: row.lesson.section.order,
          },
        }
      : null,
  };
}

export type NoteDto = ReturnType<typeof toNoteDto>;
