import { LessonType, MuxAssetStatus } from '@prisma/client';

export interface ChecklistItem {
  key: string;
  ok: boolean;
}

interface ChecklistLesson {
  type: LessonType;
  muxAssetStatus: MuxAssetStatus;
  articleContent: string | null;
  quiz: { questions: unknown[] } | null;
  codingExercise: { tests: unknown } | null;
}

interface ChecklistCourse {
  title: string;
  thumbnailUrl: string | null;
  description: string;
  lessonsCount: number;
  sections: { lessons: ChecklistLesson[] }[];
}

export const MIN_LESSONS = 3;

/**
 * Server + client share these checklist rules so the publish button and the
 * submit-for-review guard never disagree. Returns one item per rule.
 */
export function buildPublishChecklist(course: ChecklistCourse): ChecklistItem[] {
  const lessons = course.sections.flatMap((s) => s.lessons);

  const videosReady = lessons
    .filter((l) => l.type === LessonType.VIDEO)
    .every((l) => l.muxAssetStatus === MuxAssetStatus.READY);

  const articlesFilled = lessons
    .filter((l) => l.type === LessonType.ARTICLE)
    .every((l) => (l.articleContent ?? '').trim().length > 0);

  const quizzesReady = lessons
    .filter((l) => l.type === LessonType.QUIZ)
    .every((l) => (l.quiz?.questions.length ?? 0) > 0);

  const codingReady = lessons
    .filter((l) => l.type === LessonType.CODING)
    .every(
      (l) =>
        Array.isArray(l.codingExercise?.tests) &&
        l.codingExercise!.tests.length > 0,
    );

  return [
    { key: 'title', ok: course.title.trim().length > 0 },
    { key: 'thumbnail', ok: Boolean(course.thumbnailUrl) },
    { key: 'description', ok: course.description.trim().length > 0 },
    { key: 'minLessons', ok: course.lessonsCount >= MIN_LESSONS },
    { key: 'videosReady', ok: videosReady },
    { key: 'articlesFilled', ok: articlesFilled },
    { key: 'quizzesReady', ok: quizzesReady },
    { key: 'codingReady', ok: codingReady },
  ];
}
