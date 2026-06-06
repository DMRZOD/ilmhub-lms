import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';

import { MessagesService } from './messages.service';
import { createMockPrisma } from '../../test-utils/mocks';

describe('MessagesService (unit)', () => {
  let prisma: any;
  let notifications: { createAndNotify: jest.Mock };
  let service: MessagesService;

  beforeEach(() => {
    prisma = createMockPrisma();
    notifications = { createAndNotify: jest.fn().mockResolvedValue(undefined) };
    service = new MessagesService(prisma, notifications as any);
  });

  describe('getConversation (membership)', () => {
    it('throws NotFoundException when the conversation is missing', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);
      await expect(
        service.getConversation('u1', 'c1', 1, 20),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when the user is not a participant', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'i1',
        studentId: 's1',
        instructor: { id: 'i1', name: 'I', avatarUrl: null },
        student: { id: 's1', name: 'S', avatarUrl: null },
      });
      await expect(
        service.getConversation('intruder', 'c1', 1, 20),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('startConversation (instructor -> student)', () => {
    it('throws ForbiddenException when messaging yourself', async () => {
      await expect(
        service.startConversation('i1', { studentId: 'i1' } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws ForbiddenException when the student is not enrolled', async () => {
      prisma.enrollment.findFirst.mockResolvedValue(null);
      await expect(
        service.startConversation('i1', { studentId: 's1' } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('upserts a conversation and skips messaging when no body', async () => {
      prisma.enrollment.findFirst.mockResolvedValue({ id: 'e1' });
      prisma.conversation.upsert.mockResolvedValue({ id: 'c1' });
      const sendSpy = jest.spyOn(service, 'sendMessage');

      const res = await service.startConversation('i1', {
        studentId: 's1',
      } as any);

      expect(res).toEqual({ id: 'c1' });
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('sends the optional first message', async () => {
      prisma.enrollment.findFirst.mockResolvedValue({ id: 'e1' });
      prisma.conversation.upsert.mockResolvedValue({ id: 'c1' });
      const sendSpy = jest
        .spyOn(service, 'sendMessage')
        .mockResolvedValue({} as any);

      await service.startConversation('i1', {
        studentId: 's1',
        body: 'hi',
      } as any);

      expect(sendSpy).toHaveBeenCalledWith('i1', 'c1', 'hi');
    });
  });

  describe('startConversationWithInstructor (student -> instructor)', () => {
    it('throws ForbiddenException when messaging yourself', async () => {
      await expect(
        service.startConversationWithInstructor('u1', 'u1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws NotFoundException when the instructor does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.startConversationWithInstructor('s1', 'i1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when the student is not enrolled', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'i1' });
      prisma.enrollment.findFirst.mockResolvedValue(null);
      await expect(
        service.startConversationWithInstructor('s1', 'i1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('upserts the conversation for an enrolled student', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'i1' });
      prisma.enrollment.findFirst.mockResolvedValue({ id: 'e1' });
      prisma.conversation.upsert.mockResolvedValue({ id: 'c1' });
      const sendSpy = jest.spyOn(service, 'sendMessage');

      const res = await service.startConversationWithInstructor('s1', 'i1');

      expect(res).toEqual({ id: 'c1' });
      expect(prisma.conversation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            instructorId_studentId: { instructorId: 'i1', studentId: 's1' },
          },
        }),
      );
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('sends the optional first message as the student', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'i1' });
      prisma.enrollment.findFirst.mockResolvedValue({ id: 'e1' });
      prisma.conversation.upsert.mockResolvedValue({ id: 'c1' });
      const sendSpy = jest
        .spyOn(service, 'sendMessage')
        .mockResolvedValue({} as any);

      await service.startConversationWithInstructor('s1', 'i1', 'salom');

      expect(sendSpy).toHaveBeenCalledWith('s1', 'c1', 'salom');
    });
  });

  describe('sendMessage', () => {
    const conv = {
      id: 'c1',
      instructorId: 'i1',
      studentId: 's1',
      instructor: { id: 'i1', name: 'I', avatarUrl: null },
      student: { id: 's1', name: 'S', avatarUrl: null },
    };

    beforeEach(() => {
      prisma.conversation.findUnique.mockResolvedValue(conv);
      prisma.user.findUnique.mockResolvedValue({ name: 'Sender' });
      prisma.message.create.mockResolvedValue({
        id: 'm1',
        body: 'hello',
        senderId: 'i1',
        readAt: null,
        createdAt: new Date(),
      });
    });

    it('notifies the student when the instructor sends', async () => {
      await service.sendMessage('i1', 'c1', 'hello');
      expect(notifications.createAndNotify).toHaveBeenCalledWith(
        's1',
        expect.objectContaining({
          type: NotificationType.NEW_MESSAGE,
          link: '/student/messages',
        }),
      );
    });

    it('notifies the instructor when the student sends', async () => {
      prisma.message.create.mockResolvedValue({
        id: 'm2',
        body: 'hi',
        senderId: 's1',
        readAt: null,
        createdAt: new Date(),
      });
      await service.sendMessage('s1', 'c1', 'hi');
      expect(notifications.createAndNotify).toHaveBeenCalledWith(
        'i1',
        expect.objectContaining({
          type: NotificationType.NEW_MESSAGE,
          link: '/instructor/messages',
        }),
      );
    });
  });

  describe('unreadCount', () => {
    it('returns the prisma count', async () => {
      prisma.message.count.mockResolvedValue(3);
      await expect(service.unreadCount('u1')).resolves.toEqual({ count: 3 });
    });
  });
});
