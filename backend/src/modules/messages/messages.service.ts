import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { StartConversationDto } from './dto/start-conversation.dto';
import { NotificationsService } from '../notifications/notifications.service';

const USER_SELECT = { id: true, name: true, avatarUrl: true } as const;

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async listConversations(userId: string) {
    const convs = await this.prisma.conversation.findMany({
      where: { OR: [{ instructorId: userId }, { studentId: userId }] },
      orderBy: { lastMessageAt: 'desc' },
      select: {
        id: true,
        instructorId: true,
        studentId: true,
        lastMessageAt: true,
        instructor: { select: USER_SELECT },
        student: { select: USER_SELECT },
      },
    });

    if (convs.length === 0) return [];

    const convIds = convs.map((c) => c.id);

    const [lastMessages, unreadGroups] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId: { in: convIds } },
        orderBy: { createdAt: 'desc' },
        distinct: ['conversationId'],
        select: {
          conversationId: true,
          body: true,
          senderId: true,
          createdAt: true,
        },
      }),
      this.prisma.message.groupBy({
        by: ['conversationId'],
        where: {
          conversationId: { in: convIds },
          senderId: { not: userId },
          readAt: null,
        },
        _count: { _all: true },
      }),
    ]);

    const lastByConv = new Map(lastMessages.map((m) => [m.conversationId, m]));
    const unreadByConv = new Map(
      unreadGroups.map((g) => [g.conversationId, g._count._all]),
    );

    return convs.map((c) => {
      const otherUser = c.instructorId === userId ? c.student : c.instructor;
      const last = lastByConv.get(c.id);
      return {
        id: c.id,
        otherUser,
        role: c.instructorId === userId ? 'INSTRUCTOR' : 'STUDENT',
        lastMessageAt: c.lastMessageAt.toISOString(),
        lastMessage: last
          ? {
              body: last.body,
              senderId: last.senderId,
              createdAt: last.createdAt.toISOString(),
            }
          : null,
        unreadCount: unreadByConv.get(c.id) ?? 0,
      };
    });
  }

  private async requireMembership(userId: string, conversationId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        instructorId: true,
        studentId: true,
        instructor: { select: USER_SELECT },
        student: { select: USER_SELECT },
      },
    });
    if (!conv) throw new NotFoundException('conversation_not_found');
    if (conv.instructorId !== userId && conv.studentId !== userId) {
      throw new ForbiddenException('not_a_participant');
    }
    return conv;
  }

  async getConversation(
    userId: string,
    conversationId: string,
    page: number,
    limit: number,
  ) {
    const conv = await this.requireMembership(userId, conversationId);

    // Mark incoming messages as read.
    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.message.count({ where: { conversationId } }),
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          body: true,
          senderId: true,
          readAt: true,
          createdAt: true,
        },
      }),
    ]);

    // Return oldest-first for display.
    const messages = rows.reverse().map((m) => ({
      id: m.id,
      body: m.body,
      senderId: m.senderId,
      readAt: m.readAt ? m.readAt.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
    }));

    const otherUser =
      conv.instructorId === userId ? conv.student : conv.instructor;

    return {
      conversation: { id: conv.id, otherUser },
      messages: paginate(messages, total, page, limit),
    };
  }

  async startConversation(instructorId: string, dto: StartConversationDto) {
    if (dto.studentId === instructorId) {
      throw new ForbiddenException('cannot_message_self');
    }

    // The instructor may only message students enrolled in their courses.
    if (!(await this.enrollmentLinkExists(instructorId, dto.studentId))) {
      throw new ForbiddenException('student_not_enrolled');
    }

    const conv = await this.upsertConversation(instructorId, dto.studentId);

    if (dto.body && dto.body.trim().length > 0) {
      await this.sendMessage(instructorId, conv.id, dto.body);
    }

    return { id: conv.id };
  }

  /**
   * Student-initiated DM: a student may open a conversation with an instructor
   * whose course they are enrolled in. Mirrors `startConversation` with the
   * roles reversed.
   */
  async startConversationWithInstructor(
    studentId: string,
    instructorId: string,
    body?: string,
  ) {
    if (instructorId === studentId) {
      throw new ForbiddenException('cannot_message_self');
    }

    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId },
      select: { id: true },
    });
    if (!instructor) throw new NotFoundException('instructor_not_found');

    if (!(await this.enrollmentLinkExists(instructorId, studentId))) {
      throw new ForbiddenException('not_enrolled');
    }

    const conv = await this.upsertConversation(instructorId, studentId);

    if (body && body.trim().length > 0) {
      await this.sendMessage(studentId, conv.id, body);
    }

    return { id: conv.id };
  }

  /** True when the student is enrolled in at least one of the instructor's courses. */
  private async enrollmentLinkExists(
    instructorId: string,
    studentId: string,
  ): Promise<boolean> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId: studentId, course: { instructorId } },
      select: { id: true },
    });
    return Boolean(enrollment);
  }

  private upsertConversation(instructorId: string, studentId: string) {
    return this.prisma.conversation.upsert({
      where: { instructorId_studentId: { instructorId, studentId } },
      create: { instructorId, studentId },
      update: {},
      select: { id: true },
    });
  }

  async sendMessage(userId: string, conversationId: string, body: string) {
    const conv = await this.requireMembership(userId, conversationId);
    const recipientId =
      conv.instructorId === userId ? conv.studentId : conv.instructorId;
    const recipientIsInstructor = recipientId === conv.instructorId;

    const sender = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: { conversationId, senderId: userId, body },
        select: {
          id: true,
          body: true,
          senderId: true,
          readAt: true,
          createdAt: true,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      return created;
    });

    await this.notifications.createAndNotify(recipientId, {
      type: NotificationType.NEW_MESSAGE,
      title: 'Yangi xabar',
      body: `${sender?.name ?? 'Foydalanuvchi'}: ${body.slice(0, 120)}`,
      link: recipientIsInstructor ? '/instructor/messages' : '/student/messages',
    });

    return {
      id: message.id,
      body: message.body,
      senderId: message.senderId,
      readAt: message.readAt ? message.readAt.toISOString() : null,
      createdAt: message.createdAt.toISOString(),
    };
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        senderId: { not: userId },
        readAt: null,
        conversation: {
          OR: [{ instructorId: userId }, { studentId: userId }],
        },
      },
    });
    return { count };
  }
}
