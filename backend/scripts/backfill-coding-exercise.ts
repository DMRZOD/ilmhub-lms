/**
 * Backfill the coding exercise for the `web-html-css` course's CODING lesson(s)
 * that were added to the published course outside the seed and therefore have no
 * `CodingExercise` row (which makes the learner-side coding panel 404 with
 * `coding_exercise_not_found`).
 *
 * Idempotent — safe to re-run. Run against the live DB without a full reseed:
 *   node --env-file=.env -r ts-node/register/transpile-only scripts/backfill-coding-exercise.ts
 */
import { Prisma, PrismaClient } from '@prisma/client';

import { CODING_JS_MAKE_TAG } from '../prisma/curated-courses';

const COURSE_SLUG = 'web-html-css';
const LESSON_DESCRIPTION = 'makeTag(tag, content) funksiyasini yozing.';

async function main() {
  const prisma = new PrismaClient();
  try {
    const orphans = await prisma.lesson.findMany({
      where: {
        type: 'CODING',
        codingExercise: null,
        section: { course: { slug: COURSE_SLUG } },
      },
      select: { id: true, title: true, description: true },
    });

    if (orphans.length === 0) {
      console.log(
        `No CODING lessons without an exercise found in "${COURSE_SLUG}". Nothing to do.`,
      );
      return;
    }

    for (const lesson of orphans) {
      await prisma.codingExercise.upsert({
        where: { lessonId: lesson.id },
        create: {
          lessonId: lesson.id,
          language: CODING_JS_MAKE_TAG.language,
          entryFunction: CODING_JS_MAKE_TAG.entryFunction,
          starterCode: CODING_JS_MAKE_TAG.starterCode,
          solutionCode: CODING_JS_MAKE_TAG.solutionCode,
          tests: CODING_JS_MAKE_TAG.tests as unknown as Prisma.InputJsonValue,
        },
        update: {
          language: CODING_JS_MAKE_TAG.language,
          entryFunction: CODING_JS_MAKE_TAG.entryFunction,
          starterCode: CODING_JS_MAKE_TAG.starterCode,
          solutionCode: CODING_JS_MAKE_TAG.solutionCode,
          tests: CODING_JS_MAKE_TAG.tests as unknown as Prisma.InputJsonValue,
        },
      });

      // Give the lesson a prompt + a sensible duration if it's still blank.
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          description: lesson.description ?? LESSON_DESCRIPTION,
          ...(lesson.description ? {} : { durationSeconds: 300 }),
        },
      });

      console.log(
        `Attached "${CODING_JS_MAKE_TAG.entryFunction}" exercise to lesson "${lesson.title}" (${lesson.id}).`,
      );
    }

    console.log(`Done. Backfilled ${orphans.length} lesson(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
