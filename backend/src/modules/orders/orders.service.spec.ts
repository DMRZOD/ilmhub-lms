import { BadRequestException, NotFoundException } from '@nestjs/common';

import { OrdersService } from './orders.service';
import {
  createMockConfig,
  createMockLogger,
  createMockPrisma,
} from '../../test-utils/mocks';

describe('OrdersService (unit)', () => {
  let prisma: any;
  let enrollments: any;
  let email: any;
  let notifications: any;
  let service: OrdersService;

  const config = createMockConfig({ FRONTEND_URL: 'http://localhost:3000' });

  beforeEach(() => {
    prisma = createMockPrisma();
    enrollments = { grantEnrollment: jest.fn().mockResolvedValue(undefined) };
    email = {
      sendOrderConfirmationEmail: jest.fn().mockResolvedValue(undefined),
    };
    notifications = { createAndNotify: jest.fn().mockResolvedValue(undefined) };
    service = new OrdersService(
      prisma,
      enrollments,
      email,
      notifications,
      config,
      createMockLogger(),
    );
  });

  describe('create', () => {
    const dto = { courseIds: ['c1', 'c2'], paymentMethod: 'CARD' as any };

    it('throws NotFoundException when a course id does not resolve', async () => {
      prisma.course.findMany.mockResolvedValue([
        { id: 'c1', status: 'PUBLISHED', priceUsdCents: 5000, discountUsdCents: null },
      ]);
      await expect(service.create('u1', dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws BadRequestException when a course is not published', async () => {
      prisma.course.findMany.mockResolvedValue([
        { id: 'c1', status: 'PUBLISHED', priceUsdCents: 5000, discountUsdCents: null },
        { id: 'c2', status: 'DRAFT', priceUsdCents: 5000, discountUsdCents: null },
      ]);
      await expect(service.create('u1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects free courses (they enroll via /enrollments, not orders)', async () => {
      prisma.course.findMany.mockResolvedValue([
        { id: 'c1', status: 'PUBLISHED', priceUsdCents: 5000, discountUsdCents: null },
        { id: 'c2', status: 'PUBLISHED', priceUsdCents: 0, discountUsdCents: null },
      ]);
      await expect(service.create('u1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects when the user is already enrolled', async () => {
      prisma.course.findMany.mockResolvedValue([
        { id: 'c1', status: 'PUBLISHED', priceUsdCents: 5000, discountUsdCents: null },
        { id: 'c2', status: 'PUBLISHED', priceUsdCents: 5000, discountUsdCents: null },
      ]);
      prisma.enrollment.findMany.mockResolvedValue([{ courseId: 'c1' }]);
      await expect(service.create('u1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('uses the discounted price and sums the order total', async () => {
      prisma.course.findMany.mockResolvedValue([
        { id: 'c1', status: 'PUBLISHED', priceUsdCents: 10000, discountUsdCents: 8000 },
        { id: 'c2', status: 'PUBLISHED', priceUsdCents: 5000, discountUsdCents: null },
      ]);
      prisma.enrollment.findMany.mockResolvedValue([]);
      prisma.order.create.mockResolvedValue({ id: 'o1' });

      const res = await service.create('u1', dto);

      expect(res.orderId).toBe('o1');
      expect(res.paymentUrl).toContain('orderId=o1');
      const orderArg = prisma.order.create.mock.calls[0][0];
      expect(orderArg.data.totalUsdCents).toBe(13000); // 8000 + 5000
      expect(orderArg.data.items.create).toEqual([
        { courseId: 'c1', priceUsdCents: 8000 },
        { courseId: 'c2', priceUsdCents: 5000 },
      ]);
    });
  });

  describe('handleWebhook', () => {
    it('is idempotent for an already-paid order', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'o1',
        userId: 'u1',
        status: 'PAID',
        items: [{ courseId: 'c1' }],
      });

      const res = await service.handleWebhook('PAYME' as any, {
        orderId: 'o1',
        status: 'PAID',
      } as any);

      expect(res).toEqual({ ok: true, orderId: 'o1', status: 'PAID' });
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(enrollments.grantEnrollment).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for an unknown order', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(
        service.handleWebhook('PAYME' as any, {
          orderId: 'nope',
          status: 'PAID',
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
