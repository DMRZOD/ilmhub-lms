import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type RevenueItem = { totalUsdCents: number; paidAt: Date | null };

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /** All aggregates for the dashboard top stats + moderation quick actions. */
  async getOverview() {
    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const [
      totalUsers,
      totalCourses,
      publishedCourses,
      mrr,
      activeStudentGroups,
      pendingCoursesCount,
      pendingApplicationsCount,
      pendingCourses,
      pendingApplications,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.order.aggregate({
        _sum: { totalUsdCents: true },
        where: { status: 'PAID', paidAt: { gte: startOfMonth } },
      }),
      // active students = distinct users with at least one enrollment
      this.prisma.enrollment.groupBy({ by: ['userId'] }),
      this.prisma.course.count({ where: { status: 'PENDING_REVIEW' } }),
      this.prisma.instructorApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.course.findMany({
        where: { status: 'PENDING_REVIEW' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          instructor: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      this.prisma.instructorApplication.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          expertise: true,
          createdAt: true,
          applicant: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
    ]);

    return {
      stats: {
        totalUsers,
        totalCourses,
        publishedCourses,
        mrrUsdCents: mrr._sum.totalUsdCents ?? 0,
        activeStudents: activeStudentGroups.length,
        pendingModeration: {
          courses: pendingCoursesCount,
          applications: pendingApplicationsCount,
          total: pendingCoursesCount + pendingApplicationsCount,
        },
      },
      pendingCourses: pendingCourses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        createdAt: c.createdAt.toISOString(),
        instructor: c.instructor,
      })),
      pendingApplications: pendingApplications.map((a) => ({
        id: a.id,
        expertise: a.expertise,
        createdAt: a.createdAt.toISOString(),
        applicant: a.applicant,
      })),
    };
  }

  /** Daily new registrations for the last 30 days. */
  async getUsersGrowth() {
    const chartStart = new Date();
    chartStart.setUTCHours(0, 0, 0, 0);
    chartStart.setUTCDate(chartStart.getUTCDate() - 29); // 30-day window incl. today

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: chartStart } },
      select: { createdAt: true },
    });

    return buildDailyCountSeries(
      chartStart,
      30,
      users.map((u) => u.createdAt),
    );
  }

  /** Monthly gross revenue (GMV) for the last 12 months. */
  async getRevenue() {
    const now = new Date();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1),
    );

    const orders = await this.prisma.order.findMany({
      where: { status: 'PAID', paidAt: { gte: start } },
      select: { totalUsdCents: true, paidAt: true },
    });

    return buildMonthlySeries(start, 12, orders);
  }

  /** Top 10 courses by enrollments (denormalized studentsCount). */
  async getTopCourses() {
    const courses = await this.prisma.course.findMany({
      orderBy: { studentsCount: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        studentsCount: true,
        ratingAvg: true,
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        category: { select: { name: true } },
      },
    });

    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      studentsCount: c.studentsCount,
      ratingAvg: Number(c.ratingAvg),
      instructor: c.instructor,
      category: c.category?.name ?? null,
    }));
  }

  /** Enrollments grouped by category (for the pie chart). */
  async getTopCategories() {
    const [grouped, categories] = await Promise.all([
      this.prisma.course.groupBy({
        by: ['categoryId'],
        _sum: { studentsCount: true },
      }),
      this.prisma.category.findMany({ select: { id: true, name: true } }),
    ]);

    const nameById = new Map(categories.map((c) => [c.id, c.name]));

    return grouped
      .map((g) => ({
        id: g.categoryId,
        name: nameById.get(g.categoryId) ?? 'Boshqa',
        enrollments: g._sum.studentsCount ?? 0,
      }))
      .filter((g) => g.enrollments > 0)
      .sort((a, b) => b.enrollments - a.enrollments);
  }
}

function buildDailyCountSeries(start: Date, days: number, dates: Date[]) {
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    buckets.set(dayKey(d), 0);
  }
  for (const date of dates) {
    const key = dayKey(date);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }
  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

function buildMonthlySeries(start: Date, months: number, items: RevenueItem[]) {
  const buckets = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const d = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1),
    );
    buckets.set(monthKey(d), 0);
  }
  for (const item of items) {
    if (!item.paidAt) continue;
    const key = monthKey(item.paidAt);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + item.totalUsdCents);
    }
  }
  return Array.from(buckets.entries()).map(([month, revenueUsdCents]) => ({
    month,
    revenueUsdCents,
  }));
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function monthKey(d: Date): string {
  return d.toISOString().slice(0, 7);
}
