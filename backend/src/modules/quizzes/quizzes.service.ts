import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, QuizQuestion, QuizQuestionType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { LessonsService } from '../lessons/lessons.service';
import { SubmitAttemptDto, AnswerInputDto } from './dto/submit-attempt.dto';
import { toPublicQuestion } from './quizzes.mapper';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly enrollments: EnrollmentsService,
    private readonly lessons: LessonsService,
  ) {}

  /** GET /lessons/:lessonId/quiz — quiz + public questions (no correct answers). */
  async getQuizForLesson(userId: string, lessonId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        lesson: {
          select: { isPreview: true, section: { select: { courseId: true } } },
        },
      },
    });
    if (!quiz) throw new NotFoundException('quiz_not_found');

    const courseId = quiz.lesson.section.courseId;
    const enrolled = await this.enrollments.isUserEnrolled(userId, courseId);
    if (!enrolled && !quiz.lesson.isPreview) {
      throw new ForbiddenException('not_enrolled');
    }

    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId, quizId: quiz.id },
      select: { score: true, passedAt: true },
    });
    const used = attempts.length;
    const unlimited = quiz.attemptsAllowed === 0;

    return {
      id: quiz.id,
      lessonId: quiz.lessonId,
      passingScore: quiz.passingScore,
      attemptsAllowed: quiz.attemptsAllowed,
      questionCount: quiz.questions.length,
      questions: quiz.questions.map(toPublicQuestion),
      myAttempts: {
        used,
        remaining: unlimited ? null : Math.max(quiz.attemptsAllowed - used, 0),
        bestScore: attempts.reduce((m, a) => Math.max(m, a.score), 0),
        passed: attempts.some((a) => a.passedAt !== null),
      },
    };
  }

  /** POST /quizzes/:id/attempts — grade answers, store attempt, maybe complete lesson. */
  async submitAttempt(userId: string, quizId: string, dto: SubmitAttemptDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        lesson: { select: { id: true, section: { select: { courseId: true } } } },
      },
    });
    if (!quiz) throw new NotFoundException('quiz_not_found');

    const courseId = quiz.lesson.section.courseId;
    const enrolled = await this.enrollments.isUserEnrolled(userId, courseId);
    if (!enrolled) throw new ForbiddenException('not_enrolled');

    const unlimited = quiz.attemptsAllowed === 0;
    const used = await this.prisma.quizAttempt.count({
      where: { userId, quizId },
    });
    if (!unlimited && used >= quiz.attemptsAllowed) {
      throw new ForbiddenException('attempts_exhausted');
    }

    const answerMap = new Map<string, AnswerInputDto>(
      dto.answers.map((a) => [a.questionId, a]),
    );

    const graded = quiz.questions.map((q) => {
      const answer = answerMap.get(q.id);
      return { question: q, answer, correct: this.isCorrect(q, answer) };
    });

    const total = quiz.questions.length;
    const correctCount = graded.filter((g) => g.correct).length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = score >= quiz.passingScore;
    const now = new Date();

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        answers: dto.answers as unknown as Prisma.InputJsonValue,
        passedAt: passed ? now : null,
      },
      select: { id: true },
    });

    // ТЗ п.3: a passed quiz marks the lesson complete.
    if (passed) {
      await this.lessons.markLessonCompleted(userId, quiz.lesson.id);
    }

    const attemptsUsed = used + 1;
    const attemptsRemaining = unlimited
      ? null
      : Math.max(quiz.attemptsAllowed - attemptsUsed, 0);

    // ТЗ: reveal the per-question breakdown only when passed or attempts are unlimited.
    const revealed = passed || unlimited;

    return {
      attemptId: attempt.id,
      score,
      passed,
      passingScore: quiz.passingScore,
      attemptsUsed,
      attemptsAllowed: quiz.attemptsAllowed,
      attemptsRemaining,
      revealed,
      questions: revealed
        ? graded.map(({ question, answer, correct }) => ({
            questionId: question.id,
            correct,
            yourSelectedOptionIds: answer?.selectedOptionIds ?? [],
            yourTextAnswer: answer?.textAnswer ?? null,
            correctAnswerIds: question.correctAnswerIds,
            explanation: question.explanation,
          }))
        : [],
    };
  }

  /** GET /me/quizzes/:id/attempts — my attempt history. */
  async listMyAttempts(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true },
    });
    if (!quiz) throw new NotFoundException('quiz_not_found');

    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, score: true, passedAt: true, createdAt: true },
    });

    return attempts.map((a) => ({
      id: a.id,
      score: a.score,
      passed: a.passedAt !== null,
      createdAt: a.createdAt.toISOString(),
    }));
  }

  private isCorrect(q: QuizQuestion, answer?: AnswerInputDto): boolean {
    if (!answer) return false;

    if (q.type === QuizQuestionType.TEXT) {
      const given = normalizeText(answer.textAnswer);
      if (!given) return false;
      return q.correctAnswerIds.some((a) => normalizeText(a) === given);
    }

    // SINGLE / MULTIPLE: selected option ids must match the correct set exactly.
    return setEquals(answer.selectedOptionIds ?? [], q.correctAnswerIds);
  }
}

function normalizeText(value?: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

function setEquals(a: string[], b: string[]): boolean {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  for (const x of setA) if (!setB.has(x)) return false;
  return true;
}
