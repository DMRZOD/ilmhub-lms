import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { paginate } from '../../common/dto/pagination.dto';
import { ListRefundsDto } from './dto/list-refunds.dto';
import { RefundGatewayService } from './refund-gateway.service';
import { NotificationsService } from '../notifications/notifications.service';

const REFUND_INCLUDE = {
  user: { select: { id: true, name: true, email: true, avatarUrl: true } },
  order: {
    select: {
      id: true,
      totalUsdCents: true,
      paymentMethod: true,
      status: true,
      externalPaymentId: true,
      paidAt: true,
      createdAt: true,
      items: {
        select: {
          priceUsdCents: true,
          course: {
            select: { id: true, title: true, slug: true, thumbnailUrl: true },
          },
        },
      },
    },
  },
} satisfies Prisma.RefundRequestInclude;

type RefundWithRelations = Prisma.RefundRequestGetPayload<{
  include: typeof REFUND_INCLUDE;
}>;

const ORDERS_LINK = '/me/orders';

@Injectable()
export class AdminRefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly audit: AuditService,
    private readonly enrollments: EnrollmentsService,
    private readonly gateway: RefundGatewayService,
    private readonly notif: NotificationsService,
  ) {}

  // ---------- List ----------

  async list(query: ListRefundsDto) {
    const { page, limit, status } = query;
    const where: Prisma.RefundRequestWhereInput =
      status === 'ALL' ? {} : { status };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.refundRequest.count({ where }),
      this.prisma.refundRequest.findMany({
        where,
        include: REFUND_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return paginate(rows.map(toRefundDto), total, page, limit);
  }

  // ---------- Approve (mock gateway refund + revoke access) ----------

  async approve(id: string, adminId: string) {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id },
      include: REFUND_INCLUDE,
    });
    if (!refund) throw new NotFoundException('refund_not_found');
    if (refund.status !== 'REQUESTED') {
      throw new ConflictException('refund_already_decided');
    }

    const { order, user } = refund;

    // Issue the (mock) gateway refund before touching local state, mirroring
    // how a real provider call would gate the rest of the fulfillment.
    const { externalRefundId } = await this.gateway.refund({
      orderId: order.id,
      provider: order.paymentMethod,
      amountUsdCents: order.totalUsdCents,
      externalPaymentId: order.externalPaymentId,
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      });
      await tx.payment.updateMany({
        where: { orderId: order.id, status: 'SUCCESS' },
        data: { status: 'REFUNDED' },
      });
      for (const item of order.items) {
        await this.enrollments.revokeEnrollment(tx, user.id, item.course.id);
      }
      await tx.refundRequest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          decidedById: adminId,
          decidedAt: new Date(),
          externalRefundId,
        },
      });
    });

    await this.notif.createAndNotify(user.id, {
      type: NotificationType.GENERAL,
      title: 'Pul qaytarish bajarildi',
      body: `So'rovingiz tasdiqlandi va to'lov qaytarildi. Kurs(lar)ga kirish to'xtatildi.`,
      link: ORDERS_LINK,
    });

    await this.email.sendRefundConfirmationEmail(user.email, user.name, {
      courses: order.items.map((i) => ({ title: i.course.title })),
      amountUsdCents: order.totalUsdCents,
    });

    await this.audit.log(adminId, 'REFUND_APPROVED', 'REFUND_REQUEST', id, {
      orderId: order.id,
      amountUsdCents: order.totalUsdCents,
      externalRefundId,
    });

    return this.findOne(id);
  }

  // ---------- Reject ----------

  async reject(id: string, adminId: string, reason: string) {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });
    if (!refund) throw new NotFoundException('refund_not_found');
    if (refund.status !== 'REQUESTED') {
      throw new ConflictException('refund_already_decided');
    }

    await this.prisma.refundRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        decisionNote: reason,
        decidedById: adminId,
        decidedAt: new Date(),
      },
    });

    await this.notif.createAndNotify(refund.userId, {
      type: NotificationType.GENERAL,
      title: "Pul qaytarish so'rovi rad etildi",
      body: `Afsuski, pul qaytarish so'rovingiz rad etildi. Sabab: ${reason}`,
      link: ORDERS_LINK,
    });

    await this.audit.log(adminId, 'REFUND_REJECTED', 'REFUND_REQUEST', id, {
      reason,
    });

    return this.findOne(id);
  }

  // ---------- Helpers ----------

  private async findOne(id: string) {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id },
      include: REFUND_INCLUDE,
    });
    if (!refund) throw new NotFoundException('refund_not_found');
    return toRefundDto(refund);
  }
}

function toRefundDto(r: RefundWithRelations) {
  return {
    id: r.id,
    status: r.status,
    reason: r.reason,
    decisionNote: r.decisionNote,
    externalRefundId: r.externalRefundId,
    createdAt: r.createdAt.toISOString(),
    decidedAt: r.decidedAt ? r.decidedAt.toISOString() : null,
    student: r.user,
    order: {
      id: r.order.id,
      totalUsdCents: r.order.totalUsdCents,
      paymentMethod: r.order.paymentMethod,
      status: r.order.status,
      paidAt: r.order.paidAt ? r.order.paidAt.toISOString() : null,
      createdAt: r.order.createdAt.toISOString(),
    },
    courses: r.order.items.map((i) => ({
      id: i.course.id,
      title: i.course.title,
      slug: i.course.slug,
      thumbnailUrl: i.course.thumbnailUrl,
      priceUsdCents: i.priceUsdCents,
    })),
  };
}
