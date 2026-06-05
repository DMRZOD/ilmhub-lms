import type { PrismaService } from '../prisma/prisma.service';

/**
 * Resolve, per course, the lesson a student should resume at: the first lesson
 * (by section order, then lesson order) they have NOT completed yet, falling
 * back to that course's first lesson. Returns `null` for a course with no
 * lessons.
 *
 * Batched — 2 queries total regardless of how many courses are passed — so it
 * is safe to call when building a dashboard or an enrolled-courses list payload.
 * Mirrors the single-course semantics of
 * `EnrollmentsService.findNextLessonId`.
 */
export async function resolveResumeLessonIds(
  prisma: PrismaService,
  userId: string,
  courseIds: string[],
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  if (courseIds.length === 0) return result;

  const [lessons, completed] = await Promise.all([
    prisma.lesson.findMany({
      where: { section: { courseId: { in: courseIds } } },
      orderBy: [{ section: { order: 'asc' } }, { order: 'asc' }],
      select: { id: true, section: { select: { courseId: true } } },
    }),
    prisma.lessonProgress.findMany({
      where: {
        userId,
        completedAt: { not: null },
        lesson: { section: { courseId: { in: courseIds } } },
      },
      select: { lessonId: true },
    }),
  ]);

  const completedSet = new Set(completed.map((c) => c.lessonId));
  const firstByCourse = new Map<string, string>();

  // `lessons` is globally ordered; within a single course the relative order is
  // correct, so the first incomplete lesson we see per course is the right one.
  for (const lesson of lessons) {
    const cid = lesson.section.courseId;
    if (!firstByCourse.has(cid)) firstByCourse.set(cid, lesson.id);
    if (!result.get(cid) && !completedSet.has(lesson.id)) {
      result.set(cid, lesson.id);
    }
  }

  // Fully-completed (or no incomplete found) → resume at the first lesson.
  for (const cid of courseIds) {
    if (!result.get(cid)) {
      result.set(cid, firstByCourse.get(cid) ?? null);
    }
  }

  return result;
}
