import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type SalesItem = {
  priceUsdCents: number;
  order: { paidAt: Date | null };
};

@Injectable()
export class InstructorDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(instructorId: string) {
    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const chartStart = new Date();
    chartStart.setUTCHours(0, 0, 0, 0);
    chartStart.setUTCDate(chartStart.getUTCDate() - 29); // 30-day window incl. today

    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      select: { id: true, ratingAvg: true, ratingCount: true, status: true },
    });
    const courseIds = courses.map((c) => c.id);

    const paidItemsWhere = {
      courseId: { in: courseIds },
      order: { status: 'PAID' as const },
    };

    const [
      studentGroups,
      revenueAll,
      revenueMonth,
      salesWeek,
      salesItems,
      recentEnrollments,
      recentReviews,
      pendingQaCount,
      pendingQaItems,
    ] = await Promise.all([
      this.prisma.enrollment.groupBy({
        by: ['userId'],
        where: { courseId: { in: courseIds } },
      }),
      this.prisma.orderItem.aggregate({
        _sum: { priceUsdCents: true },
        where: paidItemsWhere,
      }),
      this.prisma.orderItem.aggregate({
        _sum: { priceUsdCents: true },
        where: {
          courseId: { in: courseIds },
          order: { status: 'PAID', paidAt: { gte: startOfMonth } },
        },
      }),
      this.prisma.orderItem.count({
        where: {
          courseId: { in: courseIds },
          order: { status: 'PAID', paidAt: { gte: weekAgo } },
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
      this.prisma.enrollment.findMany({
        where: { courseId: { in: courseIds } },
        orderBy: { enrolledAt: 'desc' },
        take: 8,
        select: {
          id: true,
          enrolledAt: true,
          user: { select: { id: true, name: true, avatarUrl: true } },
          course: { select: { id: true, title: true, slug: true } },
        },
      }),
      this.prisma.review.findMany({
        where: { courseId: { in: courseIds } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { id: true, name: true, avatarUrl: true } },
          course: { select: { id: true, title: true, slug: true } },
        },
      }),
      this.prisma.question.count({
        where: {
          courseId: { in: courseIds },
          hasInstructorAnswer: false,
          deletedAt: null,
        },
      }),
      this.prisma.question.findMany({
        where: {
          courseId: { in: courseIds },
          hasInstructorAnswer: false,
          deletedAt: null,
        },
        orderBy: { lastActivityAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          lastActivityAt: true,
          course: { select: { id: true, title: true, slug: true } },
        },
      }),
    ]);

    const ratingNum = courses.reduce(
      (sum, c) => sum + Number(c.ratingAvg) * c.ratingCount,
      0,
    );
    const ratingDen = courses.reduce((sum, c) => sum + c.ratingCount, 0);
    const ratingAvg =
      ratingDen > 0 ? Math.round((ratingNum / ratingDen) * 100) / 100 : 0;

    return {
      stats: {
        totalStudents: studentGroups.length,
        revenueAllTimeUsdCents: revenueAll._sum.priceUsdCents ?? 0,
        revenueThisMonthUsdCents: revenueMonth._sum.priceUsdCents ?? 0,
        ratingAvg,
        salesThisWeek: salesWeek,
        coursesCount: courses.length,
        publishedCoursesCount: courses.filter((c) => c.status === 'PUBLISHED')
          .length,
      },
      salesChart: buildDailySeries(chartStart, 30, salesItems),
      recentEnrollments: recentEnrollments.map((e) => ({
        id: e.id,
        enrolledAt: e.enrolledAt.toISOString(),
        user: e.user,
        course: e.course,
      })),
      recentReviews: recentReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
        course: r.course,
      })),
      pendingQa: {
        count: pendingQaCount,
        items: pendingQaItems.map((q) => ({
          id: q.id,
          title: q.title,
          createdAt: q.createdAt.toISOString(),
          lastActivityAt: q.lastActivityAt.toISOString(),
          course: q.course,
        })),
      },
    };
  }
}

function buildDailySeries(start: Date, days: number, items: SalesItem[]) {
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    buckets.set(dayKey(d), 0);
  }
  for (const item of items) {
    if (!item.order.paidAt) continue;
    const key = dayKey(item.order.paidAt);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + item.priceUsdCents);
    }
  }
  return Array.from(buckets.entries()).map(([date, revenueUsdCents]) => ({
    date,
    revenueUsdCents,
  }));
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
