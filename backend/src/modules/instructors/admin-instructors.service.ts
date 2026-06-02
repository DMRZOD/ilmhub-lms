import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { netRevenue } from './instructor-management.service';
import { ListAdminInstructorsDto } from './dto/list-admin-instructors.dto';

@Injectable()
export class AdminInstructorsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Approved instructors (role = INSTRUCTOR) with course / student / revenue stats. */
  async list(query: ListAdminInstructorsDto) {
    const { page, limit, q, sort } = query;

    const where: Prisma.UserWhereInput = {
      role: 'INSTRUCTOR',
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, instructors] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        // Revenue/student sorting is applied in memory after aggregation; the DB
        // order only matters for the default alphabetical view.
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    if (instructors.length === 0) {
      return paginate([], total, page, limit);
    }

    const instructorIds = instructors.map((i) => i.id);

    const [courseGroups, courses] = await Promise.all([
      this.prisma.course.groupBy({
        by: ['instructorId'],
        where: { instructorId: { in: instructorIds } },
        _count: { _all: true },
        _sum: { studentsCount: true },
      }),
      this.prisma.course.findMany({
        where: { instructorId: { in: instructorIds } },
        select: { id: true, instructorId: true },
      }),
    ]);

    const coursesByInstructor = new Map<string, number>();
    const studentsByInstructor = new Map<string, number>();
    for (const g of courseGroups) {
      coursesByInstructor.set(g.instructorId, g._count._all);
      studentsByInstructor.set(g.instructorId, g._sum.studentsCount ?? 0);
    }

    const instructorByCourse = new Map<string, string>();
    for (const c of courses) instructorByCourse.set(c.id, c.instructorId);

    const grossByInstructor = new Map<string, number>();
    const courseIds = courses.map((c) => c.id);
    if (courseIds.length > 0) {
      const items = await this.prisma.orderItem.findMany({
        where: { courseId: { in: courseIds }, order: { status: 'PAID' } },
        select: { priceUsdCents: true, courseId: true },
      });
      for (const it of items) {
        const instructorId = instructorByCourse.get(it.courseId);
        if (!instructorId) continue;
        grossByInstructor.set(
          instructorId,
          (grossByInstructor.get(instructorId) ?? 0) + it.priceUsdCents,
        );
      }
    }

    const items = instructors.map((i) => {
      const grossUsdCents = grossByInstructor.get(i.id) ?? 0;
      return {
        id: i.id,
        name: i.name,
        email: i.email,
        avatarUrl: i.avatarUrl,
        status: i.status,
        createdAt: i.createdAt.toISOString(),
        coursesCount: coursesByInstructor.get(i.id) ?? 0,
        totalStudents: studentsByInstructor.get(i.id) ?? 0,
        grossUsdCents,
        netUsdCents: netRevenue(grossUsdCents),
      };
    });

    if (sort === 'students') {
      items.sort((a, b) => b.totalStudents - a.totalStudents);
    } else if (sort === 'revenue') {
      items.sort((a, b) => b.grossUsdCents - a.grossUsdCents);
    }

    return paginate(items, total, page, limit);
  }
}
