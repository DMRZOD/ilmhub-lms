import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import {
  NotificationType,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { paginate, type PageQueryDto } from '../../common/dto/pagination.dto';
import type { Env } from '../../config/env.schema';
import {
  ORDER_DETAIL_INCLUDE,
  toOrderDto,
  type OrderWithItems,
} from './order.mapper';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { MockWebhookDto } from './dto/mock-webhook.dto';
import type { RequestRefundDto } from './dto/request-refund.dto';
import { NotificationsService } from '../notifications/notifications.service';

interface PricedCourse {
  priceUsdCents: number;
  discountUsdCents: number | null;
}

// How long after payment a student may request a refund (roadmap step 27).
const REFUND_WINDOW_DAYS = 7;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enrollments: EnrollmentsService,
    private readonly email: EmailService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService<Env, true>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OrdersService.name);
  }

  async create(userId: string, dto: CreateOrderDto) {
    const courseIds = [...new Set(dto.courseIds)];

    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: {
        id: true,
        title: true,
        status: true,
        priceUsdCents: true,
        discountUsdCents: true,
      },
    });

    if (courses.length !== courseIds.length) {
      throw new NotFoundException('course_not_found');
    }
    if (courses.some((c) => c.status !== 'PUBLISHED')) {
      throw new BadRequestException('course_not_available');
    }
    // Free courses enroll instantly via POST /enrollments — never via orders.
    if (courses.some((c) => c.priceUsdCents <= 0)) {
      throw new BadRequestException('free_course_not_orderable');
    }

    const alreadyEnrolled = await this.prisma.enrollment.findMany({
      where: { userId, courseId: { in: courseIds }, revokedAt: null },
      select: { courseId: true },
    });
    if (alreadyEnrolled.length > 0) {
      throw new BadRequestException('already_enrolled');
    }

    const totalUsdCents = courses.reduce(
      (sum, c) => sum + effectivePrice(c),
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        userId,
        totalUsdCents,
        status: OrderStatus.PENDING,
        paymentMethod: dto.paymentMethod,
        items: {
          create: courses.map((c) => ({
            courseId: c.id,
            priceUsdCents: effectivePrice(c),
          })),
        },
      },
      select: { id: true },
    });

    const frontendUrl = this.config.get('FRONTEND_URL', { infer: true });
    // Mock paymentUrl — real provider redirect URLs come in steps 25-27.
    const paymentUrl = `${frontendUrl}/checkout/success?orderId=${order.id}`;

    return { orderId: order.id, paymentUrl };
  }

  async getById(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_DETAIL_INCLUDE,
    });
    if (!order || order.userId !== userId) {
      throw new NotFoundException('order_not_found');
    }
    const firstLessonId = await this.findFirstLessonId(
      order.items[0]?.courseId,
    );
    return toOrderDto(order, firstLessonId);
  }

  async listMy(userId: string, query: PageQueryDto) {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.order.count({ where: { userId } }),
      this.prisma.order.findMany({
        where: { userId },
        include: ORDER_DETAIL_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);
    const items = rows.map((order) => toOrderDto(order, null));
    return paginate(items, total, query.page, query.limit);
  }

  // ---------- Refund requests (student side) ----------

  async requestRefund(userId: string, dto: RequestRefundDto) {
    // Find the user's most recent settled order containing this course.
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        status: 'PAID',
        items: { some: { courseId: dto.courseId } },
      },
      orderBy: { paidAt: 'desc' },
      select: {
        id: true,
        paidAt: true,
        createdAt: true,
        refundRequest: { select: { id: true } },
      },
    });
    if (!order) {
      throw new NotFoundException('paid_order_not_found');
    }
    if (order.refundRequest) {
      throw new BadRequestException('refund_already_requested');
    }

    const paidAt = order.paidAt ?? order.createdAt;
    const windowMs = REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() - paidAt.getTime() > windowMs) {
      throw new BadRequestException('refund_window_expired');
    }

    const refund = await this.prisma.refundRequest.create({
      data: {
        orderId: order.id,
        userId,
        reason: dto.reason,
        status: 'REQUESTED',
      },
      select: { id: true, orderId: true, status: true, createdAt: true },
    });

    return {
      id: refund.id,
      orderId: refund.orderId,
      status: refund.status,
      createdAt: refund.createdAt.toISOString(),
    };
  }

  async listMyRefunds(userId: string) {
    const rows = await this.prisma.refundRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderId: true,
        status: true,
        reason: true,
        decisionNote: true,
        createdAt: true,
        decidedAt: true,
        order: {
          select: {
            totalUsdCents: true,
            items: {
              select: { course: { select: { id: true, title: true } } },
            },
          },
        },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      status: r.status,
      reason: r.reason,
      decisionNote: r.decisionNote,
      createdAt: r.createdAt.toISOString(),
      decidedAt: r.decidedAt ? r.decidedAt.toISOString() : null,
      totalUsdCents: r.order.totalUsdCents,
      courses: r.order.items.map((i) => ({
        id: i.course.id,
        title: i.course.title,
      })),
    }));
  }

  async handleWebhook(provider: PaymentProvider, dto: MockWebhookDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        items: { select: { courseId: true } },
      },
    });
    if (!order) {
      throw new NotFoundException('order_not_found');
    }

    // Idempotent — a settled order is never re-processed (webhooks can retry).
    if (order.status === OrderStatus.PAID) {
      return { ok: true, orderId: order.id, status: order.status };
    }

    const payload: Prisma.InputJsonValue = {
      provider,
      orderId: dto.orderId,
      status: dto.status,
    };

    if (dto.status === 'FAILED') {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.FAILED },
        });
        await tx.payment.create({
          data: {
            orderId: order.id,
            provider,
            status: PaymentStatus.FAILED,
            rawPayload: payload,
          },
        });
      });
      this.logger.info(
        { orderId: order.id, provider },
        'payment failed (mock webhook)',
      );
      return { ok: true, orderId: order.id, status: OrderStatus.FAILED };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          paidAt: new Date(),
          externalPaymentId: `mock_${provider}_${order.id}`,
        },
      });
      await tx.payment.create({
        data: {
          orderId: order.id,
          provider,
          status: PaymentStatus.SUCCESS,
          rawPayload: payload,
        },
      });
      // Each item is a distinct course, so grants can run concurrently on the
      // same transaction client instead of awaiting one round-trip at a time.
      await Promise.all(
        order.items.map((item) =>
          this.enrollments.grantEnrollment(tx, order.userId, item.courseId),
        ),
      );
    });

    await this.notifications.createAndNotify(order.userId, {
      type: NotificationType.ORDER_PAID,
      title: "To'lov muvaffaqiyatli",
      body: `Buyurtmangiz uchun rahmat! ${order.items.length} ta kurs hisobingizga qo'shildi.`,
      link: '/student/courses',
    });

    this.logger.info(
      { orderId: order.id, provider },
      'payment confirmed (mock webhook)',
    );

    await this.sendConfirmationEmail(order.id);

    return { ok: true, orderId: order.id, status: OrderStatus.PAID };
  }

  private async sendConfirmationEmail(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        totalUsdCents: true,
        user: { select: { email: true, name: true } },
        items: { select: { course: { select: { title: true } } } },
      },
    });
    if (!order) return;
    await this.email.sendOrderConfirmationEmail(
      order.user.email,
      order.user.name,
      {
        courses: order.items.map((i) => ({ title: i.course.title })),
        totalUsdCents: order.totalUsdCents,
      },
    );
  }

  private async findFirstLessonId(courseId?: string): Promise<string | null> {
    if (!courseId) return null;
    const lesson = await this.prisma.lesson.findFirst({
      where: { section: { courseId } },
      orderBy: [{ section: { order: 'asc' } }, { order: 'asc' }],
      select: { id: true },
    });
    return lesson?.id ?? null;
  }
}

function effectivePrice(course: PricedCourse): number {
  if (
    course.discountUsdCents != null &&
    course.discountUsdCents < course.priceUsdCents
  ) {
    return course.discountUsdCents;
  }
  return course.priceUsdCents;
}
