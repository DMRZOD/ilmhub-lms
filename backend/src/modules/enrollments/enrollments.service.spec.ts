import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { EnrollmentsService } from './enrollments.service';
import { createMockPrisma } from '../../test-utils/mocks';

describe('EnrollmentsService (unit)', () => {
  let prisma: any;
  let service: EnrollmentsService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new EnrollmentsService(prisma);
  });

  describe('enroll', () => {
    it('throws NotFoundException when the course is missing', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(service.enroll('u1', 'c1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the course is not published', async () => {
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        status: 'DRAFT',
        priceUsdCents: 0,
      });
      await expect(service.enroll('u1', 'c1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws ForbiddenException (payment_required) for a paid course', async () => {
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        status: 'PUBLISHED',
        priceUsdCents: 5000,
      });
      await expect(service.enroll('u1', 'c1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('returns alreadyEnrolled for an active existing enrollment', async () => {
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        status: 'PUBLISHED',
        priceUsdCents: 0,
      });
      prisma.lesson.findFirst.mockResolvedValue({ id: 'l1' });
      prisma.enrollment.findUnique.mockResolvedValue({
        id: 'e1',
        enrolledAt: new Date('2026-01-01'),
        completedAt: null,
        revokedAt: null,
      });

      const res = await service.enroll('u1', 'c1');
      expect(res.alreadyEnrolled).toBe(true);
      expect(res.id).toBe('e1');
      expect(prisma.enrollment.create).not.toHaveBeenCalled();
    });

    it('creates a new enrollment and increments studentsCount', async () => {
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        status: 'PUBLISHED',
        priceUsdCents: 0,
      });
      prisma.lesson.findFirst.mockResolvedValue({ id: 'l1' });
      prisma.enrollment.findUnique.mockResolvedValue(null);
      prisma.enrollment.create.mockResolvedValue({
        id: 'e2',
        enrolledAt: new Date('2026-02-01'),
        completedAt: null,
      });
      prisma.course.update.mockResolvedValue({ id: 'c1' });

      const res = await service.enroll('u1', 'c1');
      expect(res.alreadyEnrolled).toBe(false);
      expect(res.id).toBe('e2');
      expect(res.firstLessonId).toBe('l1');
      expect(prisma.enrollment.create).toHaveBeenCalledTimes(1);
      expect(prisma.course.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { studentsCount: { increment: 1 } },
        }),
      );
    });
  });

  describe('grantEnrollment', () => {
    it('creates an enrollment when none exists', async () => {
      const tx = createMockPrisma();
      tx.enrollment.findUnique.mockResolvedValue(null);
      tx.enrollment.create.mockResolvedValue({ id: 'e1' });
      tx.course.update.mockResolvedValue({ id: 'c1' });

      await service.grantEnrollment(tx, 'u1', 'c1');
      expect(tx.enrollment.create).toHaveBeenCalledTimes(1);
      expect(tx.course.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { studentsCount: { increment: 1 } },
        }),
      );
    });

    it('is a no-op when an active enrollment already exists', async () => {
      const tx = createMockPrisma();
      tx.enrollment.findUnique.mockResolvedValue({ id: 'e1', revokedAt: null });

      await service.grantEnrollment(tx, 'u1', 'c1');
      expect(tx.enrollment.create).not.toHaveBeenCalled();
      expect(tx.course.update).not.toHaveBeenCalled();
    });
  });

  describe('isUserEnrolled', () => {
    it('returns true when an active enrollment row exists', async () => {
      prisma.enrollment.findFirst.mockResolvedValue({ id: 'e1' });
      expect(await service.isUserEnrolled('u1', 'c1')).toBe(true);
    });

    it('returns false when there is no enrollment', async () => {
      prisma.enrollment.findFirst.mockResolvedValue(null);
      expect(await service.isUserEnrolled('u1', 'c1')).toBe(false);
    });
  });
});
