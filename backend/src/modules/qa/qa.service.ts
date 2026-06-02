import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, Prisma, UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { paginate } from '../../common/dto/pagination.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { VoteAnswerDto } from './dto/vote-answer.dto';
import { ListQuestionsDto } from './dto/list-questions.dto';
import {
  toAnswerDto,
  toQuestionDetail,
  toQuestionListItem,
} from './qa.mapper';
import { NotificationsService } from '../notifications/notifications.service';

const AUTHOR_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
} as const;

type Actor = { id: string; role: UserRole; name?: string };

@Injectable()
export class QaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enrollments: EnrollmentsService,
    private readonly notifications: NotificationsService,
  ) {}

  async createQuestion(actor: Actor, dto: CreateQuestionDto) {
    if (dto.lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: dto.lessonId },
        select: { id: true, section: { select: { courseId: true } } },
      });
      if (!lesson || lesson.section.courseId !== dto.courseId) {
        throw new BadRequestException('lesson_not_in_course');
      }
    }

    await this.ensureEnrolled(actor.id, dto.courseId);

    const question = await this.prisma.question.create({
      data: {
        userId: actor.id,
        courseId: dto.courseId,
        lessonId: dto.lessonId ?? null,
        title: dto.title,
        body: dto.body,
        lastActivityAt: new Date(),
      },
      include: { user: { select: AUTHOR_SELECT } },
    });

    return toQuestionDetail({ ...question, answers: [] });
  }

  async listQuestions(actor: Actor, query: ListQuestionsDto) {
    await this.ensureEnrolled(actor.id, query.courseId);

    const where: Prisma.QuestionWhereInput = {
      courseId: query.courseId,
      deletedAt: null,
      ...(query.lessonId ? { lessonId: query.lessonId } : {}),
      ...(query.mine ? { userId: actor.id } : {}),
      ...(query.instructorAnswered ? { hasInstructorAnswer: true } : {}),
      ...(query.sort === 'unresolved' ? { resolvedAt: null } : {}),
    };

    const orderBy: Prisma.QuestionOrderByWithRelationInput[] =
      query.sort === 'popular'
        ? [{ answersCount: 'desc' }, { lastActivityAt: 'desc' }]
        : [{ lastActivityAt: 'desc' }];

    const { page, limit } = query;
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.question.count({ where }),
      this.prisma.question.findMany({
        where,
        include: { user: { select: AUTHOR_SELECT } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return paginate(rows.map(toQuestionListItem), total, page, limit);
  }

  async getQuestion(actor: Actor, id: string) {
    const question = await this.prisma.question.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: AUTHOR_SELECT },
        answers: {
          where: { deletedAt: null },
          include: { user: { select: AUTHOR_SELECT } },
          orderBy: [{ votesCount: 'desc' }, { createdAt: 'asc' }],
        },
      },
    });
    if (!question) throw new NotFoundException('question_not_found');

    await this.ensureEnrolled(actor.id, question.courseId);

    return toQuestionDetail(question);
  }

  async createAnswer(actor: Actor, questionId: string, dto: CreateAnswerDto) {
    const question = await this.prisma.question.findFirst({
      where: { id: questionId, deletedAt: null },
      select: {
        id: true,
        userId: true,
        courseId: true,
        lessonId: true,
        title: true,
        course: { select: { instructorId: true, slug: true } },
      },
    });
    if (!question) throw new NotFoundException('question_not_found');

    await this.ensureEnrolled(actor.id, question.courseId);

    const isInstructorAnswer = this.canModerate(
      actor,
      question.course.instructorId,
    );

    const answer = await this.prisma.$transaction(async (tx) => {
      const created = await tx.answer.create({
        data: {
          questionId: question.id,
          userId: actor.id,
          body: dto.body,
          isInstructorAnswer,
        },
        include: { user: { select: AUTHOR_SELECT } },
      });

      await tx.question.update({
        where: { id: question.id },
        data: {
          answersCount: { increment: 1 },
          lastActivityAt: new Date(),
          ...(isInstructorAnswer ? { hasInstructorAnswer: true } : {}),
        },
      });

      return created;
    });

    if (question.userId !== actor.id) {
      const link = question.lessonId
        ? `/lesson/${question.lessonId}`
        : `/courses/${question.course.slug}`;
      await this.notifications.createAndNotify(question.userId, {
        type: NotificationType.QA_ANSWER,
        title: 'Savolingizga yangi javob',
        body: `${actor.name ?? 'Foydalanuvchi'} sizning "${question.title}" savolingizga javob berdi.`,
        link,
      });
    }

    return toAnswerDto(answer);
  }

  async resolveQuestion(actor: Actor, id: string) {
    const question = await this.prisma.question.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        userId: true,
        resolvedAt: true,
        course: { select: { instructorId: true } },
      },
    });
    if (!question) throw new NotFoundException('question_not_found');

    const allowed =
      question.userId === actor.id ||
      this.canModerate(actor, question.course.instructorId);
    if (!allowed) throw new ForbiddenException('not_allowed');

    const updated = await this.prisma.question.update({
      where: { id },
      data: { resolvedAt: question.resolvedAt ? null : new Date() },
      select: { id: true, resolvedAt: true },
    });

    return { id: updated.id, isResolved: updated.resolvedAt !== null };
  }

  async voteAnswer(actor: Actor, answerId: string, dto: VoteAnswerDto) {
    const answer = await this.prisma.answer.findFirst({
      where: { id: answerId, deletedAt: null },
      select: { id: true, question: { select: { courseId: true } } },
    });
    if (!answer) throw new NotFoundException('answer_not_found');

    await this.ensureEnrolled(actor.id, answer.question.courseId);

    const updated = await this.prisma.answer.update({
      where: { id: answerId },
      data: { votesCount: { increment: dto.direction } },
      select: { id: true, votesCount: true },
    });

    return { id: updated.id, votesCount: updated.votesCount };
  }

  async removeQuestion(actor: Actor, id: string) {
    const question = await this.prisma.question.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        userId: true,
        course: { select: { instructorId: true } },
      },
    });
    if (!question) throw new NotFoundException('question_not_found');

    if (
      question.userId !== actor.id &&
      !this.canModerate(actor, question.course.instructorId)
    ) {
      throw new ForbiddenException('not_allowed');
    }

    await this.prisma.question.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }

  async removeAnswer(actor: Actor, answerId: string) {
    const answer = await this.prisma.answer.findFirst({
      where: { id: answerId, deletedAt: null },
      select: {
        id: true,
        userId: true,
        questionId: true,
        question: { select: { course: { select: { instructorId: true } } } },
      },
    });
    if (!answer) throw new NotFoundException('answer_not_found');

    if (
      answer.userId !== actor.id &&
      !this.canModerate(actor, answer.question.course.instructorId)
    ) {
      throw new ForbiddenException('not_allowed');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.answer.update({
        where: { id: answerId },
        data: { deletedAt: new Date() },
      });

      const [answersCount, instructorCount] = await Promise.all([
        tx.answer.count({
          where: { questionId: answer.questionId, deletedAt: null },
        }),
        tx.answer.count({
          where: {
            questionId: answer.questionId,
            deletedAt: null,
            isInstructorAnswer: true,
          },
        }),
      ]);

      await tx.question.update({
        where: { id: answer.questionId },
        data: {
          answersCount,
          hasInstructorAnswer: instructorCount > 0,
        },
      });
    });

    return { ok: true };
  }

  private canModerate(actor: Actor, instructorId: string): boolean {
    return actor.role === UserRole.ADMIN || actor.id === instructorId;
  }

  private async ensureEnrolled(userId: string, courseId: string) {
    const enrolled = await this.enrollments.isUserEnrolled(userId, courseId);
    if (!enrolled) throw new ForbiddenException('not_enrolled');
  }
}
