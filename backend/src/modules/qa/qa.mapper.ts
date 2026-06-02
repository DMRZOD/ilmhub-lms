export interface QaAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface AnswerRow {
  id: string;
  questionId: string;
  body: string;
  isInstructorAnswer: boolean;
  votesCount: number;
  createdAt: Date;
  user: QaAuthor;
}

export interface QuestionRow {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  body: string;
  resolvedAt: Date | null;
  answersCount: number;
  hasInstructorAnswer: boolean;
  lastActivityAt: Date;
  createdAt: Date;
  user: QaAuthor;
}

const PREVIEW_LENGTH = 240;

function toAuthor(user: QaAuthor) {
  return { id: user.id, name: user.name, avatarUrl: user.avatarUrl };
}

function preview(body: string): string {
  const trimmed = body.trim();
  return trimmed.length > PREVIEW_LENGTH
    ? `${trimmed.slice(0, PREVIEW_LENGTH)}…`
    : trimmed;
}

export function toAnswerDto(row: AnswerRow) {
  return {
    id: row.id,
    questionId: row.questionId,
    body: row.body,
    isInstructorAnswer: row.isInstructorAnswer,
    votesCount: row.votesCount,
    createdAt: row.createdAt.toISOString(),
    author: toAuthor(row.user),
  };
}

export function toQuestionListItem(row: QuestionRow) {
  return {
    id: row.id,
    courseId: row.courseId,
    lessonId: row.lessonId,
    title: row.title,
    bodyPreview: preview(row.body),
    answersCount: row.answersCount,
    hasInstructorAnswer: row.hasInstructorAnswer,
    isResolved: row.resolvedAt !== null,
    lastActivityAt: row.lastActivityAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    author: toAuthor(row.user),
  };
}

export function toQuestionDetail(row: QuestionRow & { answers: AnswerRow[] }) {
  return {
    id: row.id,
    courseId: row.courseId,
    lessonId: row.lessonId,
    title: row.title,
    body: row.body,
    answersCount: row.answersCount,
    hasInstructorAnswer: row.hasInstructorAnswer,
    isResolved: row.resolvedAt !== null,
    lastActivityAt: row.lastActivityAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    author: toAuthor(row.user),
    answers: row.answers.map(toAnswerDto),
  };
}

export type AnswerDto = ReturnType<typeof toAnswerDto>;
export type QuestionListItem = ReturnType<typeof toQuestionListItem>;
export type QuestionDetail = ReturnType<typeof toQuestionDetail>;
