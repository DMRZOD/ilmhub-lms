import * as vm from 'vm';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CodingLanguage } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { LessonsService } from '../lessons/lessons.service';
import { SubmitCodeDto } from './dto/submit-code.dto';

interface RawTestCase {
  input: string;
  expectedOutput: string;
  description?: string | null;
  weight?: number;
}

export interface TestResult {
  index: number;
  description: string | null;
  passed: boolean;
  output: string;
  expected: string;
  error?: string;
}

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
    return {
      id: exercise.id,
      language: exercise.language,
      starterCode: exercise.starterCode,
      tests: tests.map((t, i) => ({ index: i, description: t.description ?? null })),
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
    const results = this.executeTests(dto.code, tests, exercise.language);

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

  private executeTests(
    code: string,
    tests: RawTestCase[],
    language: CodingLanguage,
  ): TestResult[] {
    if (language !== CodingLanguage.JS && language !== CodingLanguage.TS) {
      throw new BadRequestException('language_not_supported_yet');
    }

    return tests.map((test, index) => {
      const outputLines: string[] = [];
      const safeConsole = {
        log: (...args: unknown[]) =>
          outputLines.push(args.map(String).join(' ')),
        error: (...args: unknown[]) =>
          outputLines.push(args.map(String).join(' ')),
        warn: (...args: unknown[]) =>
          outputLines.push(args.map(String).join(' ')),
      };

      try {
        const ctx = vm.createContext({ console: safeConsole });
        vm.runInContext(code, ctx, { timeout: 5000 });
        const result = vm.runInContext(test.input, ctx, { timeout: 5000 });
        const output = outputLines.join('\n') || String(result ?? '');
        const passed = output.trim() === test.expectedOutput.trim();

        return {
          index,
          description: test.description ?? null,
          passed,
          output,
          expected: test.expectedOutput,
        };
      } catch (err) {
        const error = (err as Error).message;
        return {
          index,
          description: test.description ?? null,
          passed: false,
          output: outputLines.join('\n'),
          expected: test.expectedOutput,
          error,
        };
      }
    });
  }
}
