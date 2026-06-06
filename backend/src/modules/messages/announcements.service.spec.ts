import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AnnouncementAudience, NotificationType, UserRole } from '@prisma/client';

import { AnnouncementsService } from './announcements.service';
import { createMockPrisma } from '../../test-utils/mocks';

describe('AnnouncementsService (unit)', () => {
  let prisma: any;
  let email: { sendAnnouncementEmail: jest.Mock };
  let notifications: { pushLive: jest.Mock };
  let enrollments: { isUserEnrolled: jest.Mock };
  let service: AnnouncementsService;

  beforeEach(() => {
    prisma = createMockPrisma();
    email = { sendAnnouncementEmail: jest.fn().mockResolvedValue(undefined) };
    notifications = { pushLive: jest.fn() };
    enrollments = { isUserEnrolled: jest.fn() };
    service = new AnnouncementsService(
      prisma,
      email as any,
      notifications as any,
      enrollments as any,
    );
  });

  describe('create', () => {
    it('throws NotFoundException for an unknown course', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(
        service.create('i1', { courseId: 'c1' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when the course is not the instructor’s', async () => {
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'other',
        title: 'T',
        slug: 'slug',
      });
      await expect(
        service.create('i1', { courseId: 'c1' } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws BadRequestException when there are no recipients', async () => {
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'i1',
        title: 'T',
        slug: 'slug',
      });
      prisma.enrollment.findMany.mockResolvedValue([]);
      await expect(
        service.create('i1', {
          courseId: 'c1',
          audience: AnnouncementAudience.SELECTED,
          userIds: ['s1'],
          subject: 'S',
          body: 'B',
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('notifies, pushes and emails each recipient (SELECTED)', async () => {
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'i1',
        title: 'T',
        slug: 'slug',
      });
      prisma.enrollment.findMany.mockResolvedValue([
        { user: { id: 's1', name: 'S', email: 's@e.com' } },
      ]);
      prisma.announcement.create.mockResolvedValue({
        id: 'a1',
        subject: 'S',
        body: 'B',
        audience: AnnouncementAudience.SELECTED,
        recipientCount: 1,
        createdAt: new Date(),
      });

      const res = await service.create('i1', {
        courseId: 'c1',
        audience: AnnouncementAudience.SELECTED,
        userIds: ['s1'],
        subject: 'S',
        body: 'B',
      } as any);

      expect(prisma.notification.createMany).toHaveBeenCalled();
      expect(notifications.pushLive).toHaveBeenCalledTimes(1);
      expect(email.sendAnnouncementEmail).toHaveBeenCalledWith(
        's@e.com',
        'S',
        expect.objectContaining({ subject: 'S', courseTitle: 'T' }),
      );
      expect(res.course).toEqual({ id: 'c1', title: 'T', slug: 'slug' });
    });

    it('deep-links a broadcast (ALL) to the resume lesson', async () => {
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'i1',
        title: 'T',
        slug: 'slug',
      });
      prisma.enrollment.findMany.mockResolvedValue([
        { user: { id: 's1', name: 'S', email: 's@e.com' } },
      ]);
      prisma.lesson.findMany.mockResolvedValue([{ id: 'l1' }, { id: 'l2' }]);
      prisma.lessonProgress.findMany.mockResolvedValue([]);
      prisma.announcement.create.mockResolvedValue({
        id: 'a1',
        subject: 'S',
        body: 'B',
        audience: AnnouncementAudience.ALL,
        recipientCount: 1,
        createdAt: new Date(),
      });

      await service.create('i1', {
        courseId: 'c1',
        audience: AnnouncementAudience.ALL,
        subject: 'S',
        body: 'B',
      } as any);

      expect(prisma.notification.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            expect.objectContaining({
              type: NotificationType.ANNOUNCEMENT,
              link: '/lesson/l1?tab=elonlar',
            }),
          ],
        }),
      );
    });
  });

  describe('listForCourse', () => {
    it('throws NotFoundException for an unknown course', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(
        service.listForCourse({ id: 's1', role: UserRole.STUDENT } as any, 'c1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when a non-enrolled student reads', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', instructorId: 'i1' });
      enrollments.isUserEnrolled.mockResolvedValue(false);
      await expect(
        service.listForCourse({ id: 's1', role: UserRole.STUDENT } as any, 'c1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('returns only ALL broadcasts for the course owner', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1', instructorId: 'i1' });
      prisma.announcement.findMany.mockResolvedValue([
        {
          id: 'a1',
          subject: 'S',
          body: 'B',
          createdAt: new Date(),
          instructor: { id: 'i1', name: 'I', avatarUrl: null },
        },
      ]);

      const res = await service.listForCourse(
        { id: 'i1', role: UserRole.INSTRUCTOR } as any,
        'c1',
      );

      expect(res).toHaveLength(1);
      expect(enrollments.isUserEnrolled).not.toHaveBeenCalled();
      expect(prisma.announcement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { courseId: 'c1', audience: AnnouncementAudience.ALL },
        }),
      );
    });
  });
});
