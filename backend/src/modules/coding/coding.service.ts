import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { LessonsService } from '../lessons/lessons.service';
import { SubmitCodeDto } from './dto/submit-code.dto';
import { executeTests, type RawTestCase } from './coding-grader';

@Injectable()
export class CodingService {
  private readonly logger = new Logger(CodingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly enrollments: EnrollmentsService,
    private readonly lessons: LessonsService,
  ) {}

  async getExerciseForLesson(userId: string, lessonId: string) {
    const exercise = await this.prisma.codingExercise.findUnique({
      where: { lessonId },
      include: {
        lesson: {
          select: { isPreview: true, section: { select: { courseId: true } } },
        },
      },
    });
    if (!exercise) throw new NotFoundException('coding_exercise_not_found');

    const courseId = exercise.lesson.section.courseId;
    const enrolled = await this.enrollments.isUserEnrolled(userId, courseId);
    if (!enrolled && !exercise.lesson.isPreview) {
      throw new ForbiddenException('not_enrolled');
    }

    const tests = (exercise.tests as unknown as RawTestCase[]) ?? [];

    // Restore the student's most recent attempt so they pick up where they left off.
    const lastSubmission = await this.prisma.codingSubmission.findFirst({
      where: { userId, exerciseId: exercise.id },
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });

    return {
      id: exercise.id,
      language: exercise.language,
      entryFunction: exercise.entryFunction,
      starterCode: exercise.starterCode,
      lastSubmittedCode: lastSubmission?.code ?? null,
      // Inputs are example cases the student may see; expected outputs stay hidden.
      tests: tests.map((t, i) => ({
        index: i,
        description: t.description ?? null,
        args: t.input,
      })),
    };
  }

  async submitCode(userId: string, exerciseId: string, dto: SubmitCodeDto) {
    const exercise = await this.prisma.codingExercise.findUnique({
      where: { id: exerciseId },
      include: {
        lesson: {
          select: {
            id: true,
            isPreview: true,
            section: { select: { courseId: true } },
          },
        },
      },
    });
    if (!exercise) throw new NotFoundException('coding_exercise_not_found');

    const courseId = exercise.lesson.section.courseId;
    const enrolled = await this.enrollments.isUserEnrolled(userId, courseId);
    if (!enrolled) throw new ForbiddenException('not_enrolled');

    const tests = (exercise.tests as unknown as RawTestCase[]) ?? [];
    const results = executeTests(
      dto.code,
      tests,
      exercise.language,
      exercise.entryFunction,
    );

    const sumWeights = tests.reduce((s, t) => s + (t.weight ?? 1), 0);
    const sumPassed = results.reduce(
      (s, r, i) => s + (r.passed ? (tests[i]?.weight ?? 1) : 0),
      0,
    );
    const weightedScore = sumWeights > 0 ? (sumPassed / sumWeights) * 100 : 0;
    const passed = sumWeights > 0 && sumPassed === sumWeights;

    await this.prisma.codingSubmission.create({
      data: {
        userId,
        exerciseId,
        code: dto.code,
        passed,
        output: JSON.stringify(results),
        solutionViewed: dto.solutionViewed ?? false,
      },
    });

    if (passed) {
      await this.lessons.markLessonCompleted(userId, exercise.lesson.id);
    }

    return { passed, weightedScore, results };
  }

  async getSolution(userId: string, exerciseId: string) {
    const exercise = await this.prisma.codingExercise.findUnique({
      where: { id: exerciseId },
      include: {
        lesson: {
          select: { isPreview: true, section: { select: { courseId: true } } },
        },
      },
    });
    if (!exercise) throw new NotFoundException('coding_exercise_not_found');

    const courseId = exercise.lesson.section.courseId;
    const enrolled = await this.enrollments.isUserEnrolled(userId, courseId);
    if (!enrolled) throw new ForbiddenException('not_enrolled');

    return { solutionCode: exercise.solutionCode };
  }

  async getMySubmissions(userId: string, exerciseId: string) {
    const exercise = await this.prisma.codingExercise.findUnique({
      where: { id: exerciseId },
      select: { id: true },
    });
    if (!exercise) throw new NotFoundException('coding_exercise_not_found');

    const submissions = await this.prisma.codingSubmission.findMany({
      where: { userId, exerciseId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, passed: true, solutionViewed: true, createdAt: true },
    });

    return submissions;
  }

}
