import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { ReviewsService } from './reviews.service';
import { createMockPrisma } from '../../test-utils/mocks';

describe('ReviewsService (unit)', () => {
  let prisma: any;
  let service: ReviewsService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new ReviewsService(prisma);
  });

  describe('create', () => {
    const verified = { id: 'u1', emailVerified: true };

    it('throws NotFoundException for an unknown/unpublished course', async () => {
      prisma.course.findFirst.mockResolvedValue(null);
      await expect(
        service.create('slug', verified, { rating: 5 } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when the email is not verified', async () => {
      prisma.course.findFirst.mockResolvedValue({ id: 'c1' });
      await expect(
        service.create(
          'slug',
          { id: 'u1', emailVerified: false },
          { rating: 5 } as any,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws ForbiddenException when the user is not enrolled', async () => {
      prisma.course.findFirst.mockResolvedValue({ id: 'c1' });
      prisma.enrollment.findFirst.mockResolvedValue(null);
      await expect(
        service.create('slug', verified, { rating: 5 } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when the review is missing', async () => {
      prisma.review.findUnique.mockResolvedValue(null);
      await expect(
        service.update('u1', 'r1', { rating: 4 } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when editing someone else’s review', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'r1',
        userId: 'someone-else',
        courseId: 'c1',
        createdAt: new Date(),
      });
      await expect(
        service.update('u1', 'r1', { rating: 4 } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws ForbiddenException once the edit window has expired', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'r1',
        userId: 'u1',
        courseId: 'c1',
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      });
      await expect(
        service.update('u1', 'r1', { rating: 4 } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('helpful / report self-guards', () => {
    it('rejects voting on your own review', async () => {
      prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'u1' });
      await expect(service.addHelpful('u1', 'r1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('rejects reporting your own review', async () => {
      prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'u1' });
      await expect(
        service.report('u1', 'r1', 'spam'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
