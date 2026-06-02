import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { paginate } from '../../common/dto/pagination.dto';
import { ListReportsDto } from './dto/list-reports.dto';

const REPORT_INCLUDE = {
  reporter: { select: { id: true, name: true, avatarUrl: true } },
  review: {
    select: {
      id: true,
      rating: true,
      comment: true,
      helpfulCount: true,
      createdAt: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
      course: { select: { id: true, title: true, slug: true } },
    },
  },
} satisfies Prisma.ReviewReportInclude;

type ReportWithRelations = Prisma.ReviewReportGetPayload<{
  include: typeof REPORT_INCLUDE;
}>;

function toReportDto(row: ReportWithRelations) {
  return {
    id: row.id,
    reason: row.reason,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
    reporter: row.reporter,
    review: {
      id: row.review.id,
      rating: row.review.rating,
      comment: row.review.comment,
      helpfulCount: row.review.helpfulCount,
      createdAt: row.review.createdAt.toISOString(),
      author: row.review.user,
      course: row.review.course,
    },
  };
}

@Injectable()
export class AdminReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notif: NotificationsService,
  ) {}

  async list(query: ListReportsDto) {
    const { page, limit, status } = query;
    const where: Prisma.ReviewReportWhereInput =
      status === 'ALL' ? {} : { status };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.reviewReport.count({ where }),
      this.prisma.reviewReport.findMany({
        where,
        include: REPORT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return paginate(rows.map(toReportDto), total, page, limit);
  }

  /** Keep the review, mark the complaint as dismissed. */
  async dismiss(id: string, adminId: string) {
    const report = await this.prisma.reviewReport.findUnique({
      where: { id },
      select: { id: true, status: true, reviewId: true },
    });
    if (!report) throw new NotFoundException('report_not_found');
    if (report.status !== 'PENDING') {
      throw new ConflictException('report_already_resolved');
    }

    await this.prisma.reviewReport.update({
      where: { id },
      data: { status: 'DISMISSED', resolvedById: adminId, resolvedAt: new Date() },
    });

    await this.audit.log(adminId, 'REVIEW_REPORT_DISMISSED', 'REVIEW_REPORT', id, {
      reviewId: report.reviewId,
    });

    return { id, status: 'DISMISSED' as const };
  }

  /** Delete the reported review (cascades reports + helpful votes), recompute aggregate. */
  async removeReview(id: string, adminId: string) {
    const report = await this.prisma.reviewReport.findUnique({
      where: { id },
      select: {
        id: true,
        reason: true,
        reporterId: true,
        review: {
          select: {
            id: true,
            userId: true,
            courseId: true,
            course: { select: { slug: true, title: true } },
          },
        },
      },
    });
    if (!report) throw new NotFoundException('report_not_found');

    const { review } = report;

    await this.prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: review.id } });
      const agg = await tx.review.aggregate({
        where: { courseId: review.courseId },
        _avg: { rating: true },
        _count: { _all: true },
      });
      await tx.course.update({
        where: { id: review.courseId },
        data: {
          ratingAvg: agg._avg.rating ?? 0,
          ratingCount: agg._count._all,
        },
      });
    });

    await this.audit.log(adminId, 'REVIEW_REMOVED', 'REVIEW', review.id, {
      courseId: review.courseId,
      reporterId: report.reporterId,
      reason: report.reason,
    });

    await this.notif.createAndNotify(review.userId, {
      type: NotificationType.GENERAL,
      title: 'Sharhingiz olib tashlandi',
      body: `"${review.course.title}" kursi uchun qoldirgan sharhingiz qoidalarga zid deb topilib olib tashlandi.`,
      link: `/courses/${review.course.slug}`,
    });

    return { id, reviewId: review.id, status: 'RESOLVED' as const };
  }
}
