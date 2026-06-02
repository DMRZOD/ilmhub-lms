import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { ListStudentsDto } from './dto/list-students.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { NotificationsService } from '../notifications/notifications.service';

/** Platform commission applied to instructor gross revenue. */
export const PLATFORM_COMMISSION_RATE = 0.1;

export function platformFee(grossUsdCents: number): number {
  return Math.round(grossUsdCents * PLATFORM_COMMISSION_RATE);
}

export function netRevenue(grossUsdCents: number): number {
  return grossUsdCents - platformFee(grossUsdCents);
}

@Injectable()
export class InstructorManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notif: NotificationsService,
  ) {}

  private async getCourseIds(instructorId: string): Promise<string[]> {
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      select: { id: true },
    });
    return courses.map((c) => c.id);
  }

  // ---------- Students ----------

  async listStudents(instructorId: string, query: ListStudentsDto) {
    const { page, limit, courseId, q } = query;
    const courseIds = await this.getCourseIds(instructorId);

    // If a course filter is provided, make sure it belongs to the instructor.
    const targetCourseIds =
      courseId && courseIds.includes(courseId) ? [courseId] : courseIds;

    if (targetCourseIds.length === 0) {
      return paginate([], 0, page, limit);
    }

    const where: Prisma.UserWhereInput = {
      enrollments: { some: { courseId: { in: targetCourseIds } } },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, name: true, email: true, avatarUrl: true },
      }),
    ]);

    if (users.length === 0) {
      return paginate([], total, page, limit);
    }

    const userIds = users.map((u) => u.id);

    const [enrollGroups, orderItems, progressRows] = await Promise.all([
      this.prisma.enrollment.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, courseId: { in: courseIds } },
        _count: { _all: true },
        _max: { enrolledAt: true },
      }),
      this.prisma.orderItem.findMany({
        where: {
          courseId: { in: courseIds },
          order: { status: 'PAID', userId: { in: userIds } },
        },
        select: { priceUsdCents: true, order: { select: { userId: true } } },
      }),
      this.prisma.lessonProgress.findMany({
        where: {
          userId: { in: userIds },
          lesson: { section: { courseId: { in: courseIds } } },
        },
        select: { userId: true, updatedAt: true },
      }),
    ]);

    const coursesByUser = new Map<string, number>();
    const lastEnrolledByUser = new Map<string, Date>();
    for (const g of enrollGroups) {
      coursesByUser.set(g.userId, g._count._all);
      if (g._max.enrolledAt) lastEnrolledByUser.set(g.userId, g._max.enrolledAt);
    }

    const spentByUser = new Map<string, number>();
    for (const item of orderItems) {
      const uid = item.order.userId;
      spentByUser.set(uid, (spentByUser.get(uid) ?? 0) + item.priceUsdCents);
    }

    const activityByUser = new Map<string, Date>();
    for (const row of progressRows) {
      const prev = activityByUser.get(row.userId);
      if (!prev || row.updatedAt > prev) {
        activityByUser.set(row.userId, row.updatedAt);
      }
    }

    const items = users.map((u) => {
      const lastActivity =
        activityByUser.get(u.id) ?? lastEnrolledByUser.get(u.id) ?? null;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        coursesCount: coursesByUser.get(u.id) ?? 0,
        totalSpentUsdCents: spentByUser.get(u.id) ?? 0,
        lastActivityAt: lastActivity ? lastActivity.toISOString() : null,
      };
    });

    return paginate(items, total, page, limit);
  }

  async getStudentDetail(instructorId: string, studentId: string) {
    const courseIds = await this.getCourseIds(instructorId);

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: studentId, courseId: { in: courseIds } },
      orderBy: { enrolledAt: 'desc' },
      select: {
        enrolledAt: true,
        completedAt: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            lessonsCount: true,
          },
        },
      },
    });

    if (enrollments.length === 0) {
      throw new NotFoundException('student_not_found');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
    if (!student) throw new NotFoundException('student_not_found');

    const enrolledCourseIds = enrollments.map((e) => e.course.id);
    const progressRows = await this.prisma.lessonProgress.findMany({
      where: {
        userId: studentId,
        lesson: { section: { courseId: { in: enrolledCourseIds } } },
      },
      select: {
        completedAt: true,
        updatedAt: true,
        lesson: { select: { section: { select: { courseId: true } } } },
      },
    });

    const completedByCourse = new Map<string, number>();
    const activityByCourse = new Map<string, Date>();
    for (const row of progressRows) {
      const cid = row.lesson.section.courseId;
      if (row.completedAt) {
        completedByCourse.set(cid, (completedByCourse.get(cid) ?? 0) + 1);
      }
      const prev = activityByCourse.get(cid);
      if (!prev || row.updatedAt > prev) activityByCourse.set(cid, row.updatedAt);
    }

    let lastActivity: Date | null = null;
    const courses = enrollments.map((e) => {
      const total = e.course.lessonsCount;
      const completed = completedByCourse.get(e.course.id) ?? 0;
      const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const activity = activityByCourse.get(e.course.id) ?? null;
      if (activity && (!lastActivity || activity > lastActivity)) {
        lastActivity = activity;
      }
      return {
        course: {
          id: e.course.id,
          title: e.course.title,
          slug: e.course.slug,
          thumbnailUrl: e.course.thumbnailUrl,
        },
        enrolledAt: e.enrolledAt.toISOString(),
        completedAt: e.completedAt ? e.completedAt.toISOString() : null,
        progressPercent,
        lastActivityAt: activity ? activity.toISOString() : null,
      };
    });

    return {
      student,
      courses,
      lastActivityAt: lastActivity
        ? (lastActivity as Date).toISOString()
        : null,
    };
  }

  // ---------- Reviews ----------

  async listReviews(instructorId: string, query: ListReviewsDto) {
    const { page, limit, courseId, replied, rating, sort } = query;
    const courseIds = await this.getCourseIds(instructorId);
    const targetCourseIds =
      courseId && courseIds.includes(courseId) ? [courseId] : courseIds;

    if (targetCourseIds.length === 0) {
      return paginate([], 0, page, limit);
    }

    const where: Prisma.ReviewWhereInput = {
      courseId: { in: targetCourseIds },
      ...(replied === true ? { repliedAt: { not: null } } : {}),
      ...(replied === false ? { repliedAt: null } : {}),
      ...(rating ? { rating } : {}),
    };

    const orderBy: Prisma.ReviewOrderByWithRelationInput =
      sort === 'oldest'
        ? { createdAt: 'asc' }
        : sort === 'highest'
          ? { rating: 'desc' }
          : sort === 'lowest'
            ? { rating: 'asc' }
            : { createdAt: 'desc' };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          replyComment: true,
          repliedAt: true,
          createdAt: true,
          user: { select: { id: true, name: true, avatarUrl: true } },
          course: { select: { id: true, title: true, slug: true } },
        },
      }),
    ]);

    const items = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      replyComment: r.replyComment,
      repliedAt: r.repliedAt ? r.repliedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
      course: r.course,
    }));

    return paginate(items, total, page, limit);
  }

  async replyToReview(instructorId: string, reviewId: string, comment: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        userId: true,
        course: { select: { instructorId: true, slug: true, title: true } },
      },
    });
    if (!review) throw new NotFoundException('review_not_found');
    if (review.course.instructorId !== instructorId) {
      throw new ForbiddenException('not_your_course');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.review.update({
        where: { id: reviewId },
        data: { replyComment: comment, repliedAt: new Date() },
        select: {
          id: true,
          rating: true,
          comment: true,
          replyComment: true,
          repliedAt: true,
          createdAt: true,
          user: { select: { id: true, name: true, avatarUrl: true } },
          course: { select: { id: true, title: true, slug: true } },
        },
      });

      return result;
    });

    if (review.userId !== instructorId) {
      await this.notif.createAndNotify(review.userId, {
        type: NotificationType.GENERAL,
        title: 'Ustoz sharhingizga javob berdi',
        body: `"${review.course.title}" kursi uchun sharhingizga javob keldi.`,
        link: `/courses/${review.course.slug}`,
      });
    }

    return {
      id: updated.id,
      rating: updated.rating,
      comment: updated.comment,
      replyComment: updated.replyComment,
      repliedAt: updated.repliedAt ? updated.repliedAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
      user: updated.user,
      course: updated.course,
    };
  }

  // ---------- Revenue ----------

  async getRevenue(instructorId: string, page: number, limit: number) {
    const courseIds = await this.getCourseIds(instructorId);

    if (courseIds.length === 0) {
      return {
        stats: emptyRevenueStats(),
        chart: buildMonthlySeries([]),
        availableBalanceUsdCents: 0,
        transactions: paginate([], 0, page, limit),
      };
    }

    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const chartStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1),
    );

    const paidWhere = {
      courseId: { in: courseIds },
      order: { status: 'PAID' as const },
    };

    const [
      grossAll,
      grossMonth,
      grossYear,
      chartItems,
      txTotal,
      txRows,
    ] = await Promise.all([
      this.prisma.orderItem.aggregate({
        _sum: { priceUsdCents: true },
        where: paidWhere,
      }),
      this.prisma.orderItem.aggregate({
        _sum: { priceUsdCents: true },
        where: {
          courseId: { in: courseIds },
          order: { status: 'PAID', paidAt: { gte: startOfMonth } },
        },
      }),
      this.prisma.orderItem.aggregate({
        _sum: { priceUsdCents: true },
        where: {
          courseId: { in: courseIds },
          order: { status: 'PAID', paidAt: { gte: startOfYear } },
        },
      }),
      this.prisma.orderItem.findMany({
        where: {
          courseId: { in: courseIds },
          order: { status: 'PAID', paidAt: { gte: chartStart } },
        },
        select: {
          priceUsdCents: true,
          order: { select: { paidAt: true } },
        },
      }),
      this.prisma.orderItem.count({ where: paidWhere }),
      this.prisma.orderItem.findMany({
        where: paidWhere,
        orderBy: { order: { paidAt: 'desc' } },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          priceUsdCents: true,
          course: { select: { id: true, title: true, slug: true } },
          order: {
            select: {
              paidAt: true,
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
      }),
    ]);

    const allGross = grossAll._sum.priceUsdCents ?? 0;
    const monthGross = grossMonth._sum.priceUsdCents ?? 0;
    const yearGross = grossYear._sum.priceUsdCents ?? 0;

    const transactions = txRows.map((t) => ({
      id: t.id,
      course: t.course,
      student: t.order.user,
      paidAt: t.order.paidAt ? t.order.paidAt.toISOString() : null,
      grossUsdCents: t.priceUsdCents,
      feeUsdCents: platformFee(t.priceUsdCents),
      netUsdCents: netRevenue(t.priceUsdCents),
    }));

    return {
      stats: {
        month: { grossUsdCents: monthGross, netUsdCents: netRevenue(monthGross) },
        year: { grossUsdCents: yearGross, netUsdCents: netRevenue(yearGross) },
        allTime: { grossUsdCents: allGross, netUsdCents: netRevenue(allGross) },
        commissionRate: PLATFORM_COMMISSION_RATE,
      },
      chart: buildMonthlySeries(chartItems),
      availableBalanceUsdCents: netRevenue(allGross),
      transactions: paginate(transactions, txTotal, page, limit),
    };
  }
}

type SalesItem = { priceUsdCents: number; order: { paidAt: Date | null } };

function emptyRevenueStats() {
  return {
    month: { grossUsdCents: 0, netUsdCents: 0 },
    year: { grossUsdCents: 0, netUsdCents: 0 },
    allTime: { grossUsdCents: 0, netUsdCents: 0 },
    commissionRate: PLATFORM_COMMISSION_RATE,
  };
}

function buildMonthlySeries(items: SalesItem[]) {
  const now = new Date();
  const buckets = new Map<string, number>();
  const labels: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = monthKey(d);
    buckets.set(key, 0);
    labels.push(key);
  }
  for (const item of items) {
    if (!item.order.paidAt) continue;
    const key = monthKey(item.order.paidAt);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + item.priceUsdCents);
    }
  }
  return labels.map((month) => {
    const gross = buckets.get(month) ?? 0;
    return { month, grossUsdCents: gross, netUsdCents: netRevenue(gross) };
  });
}

function monthKey(d: Date): string {
  return d.toISOString().slice(0, 7); // YYYY-MM
}
