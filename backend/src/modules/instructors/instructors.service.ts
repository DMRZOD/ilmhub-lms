import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { COURSE_CARD_INCLUDE, toCourseCard } from '../courses/course-card.mapper';
import type {
  InstructorSort,
  ListInstructorsDto,
} from './dto/list-instructors.dto';

export interface InstructorStats {
  coursesCount: number;
  studentsCount: number;
  ratingAvg: number;
  reviewsCount: number;
}

@Injectable()
export class InstructorsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListInstructorsDto) {
    const { page, limit, search, sort } = query;
    const where: Prisma.UserWhereInput = { role: 'INSTRUCTOR' };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const total = await this.prisma.user.count({ where });

    const aggregates = await this.computeAggregatesForAll();
    const baseUsers = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    const enriched = baseUsers.map((user) => {
      const stats = aggregates.get(user.id) ?? this.emptyStats();
      return { ...user, stats };
    });

    enriched.sort((a, b) => this.compareBySort(a, b, sort));

    const items = enriched.slice((page - 1) * limit, page * limit);
    return paginate(items, total, page, limit);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: 'INSTRUCTOR' },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('instructor_not_found');

    const stats = await this.computeAggregatesForOne(id);
    const courseRows = await this.prisma.course.findMany({
      where: { instructorId: id, status: 'PUBLISHED' },
      include: COURSE_CARD_INCLUDE,
      orderBy: [{ studentsCount: 'desc' }, { publishedAt: 'desc' }],
    });

    return {
      ...user,
      stats,
      courses: courseRows.map(toCourseCard),
    };
  }

  private async computeAggregatesForAll(): Promise<Map<string, InstructorStats>> {
    const grouped = await this.prisma.course.groupBy({
      by: ['instructorId'],
      where: { status: 'PUBLISHED' },
      _count: { _all: true },
      _sum: { studentsCount: true, ratingCount: true },
    });

    const ratingAggsRaw = await this.prisma.$queryRaw<
      Array<{ instructorId: string; ratingAvg: number | null }>
    >`
      SELECT "instructorId",
             CASE WHEN SUM("ratingCount") = 0 THEN 0
                  ELSE SUM("ratingAvg" * "ratingCount") / SUM("ratingCount")
             END AS "ratingAvg"
      FROM "Course"
      WHERE "status" = 'PUBLISHED'
      GROUP BY "instructorId"
    `;
    const ratingMap = new Map(
      ratingAggsRaw.map((r) => [r.instructorId, Number(r.ratingAvg ?? 0)]),
    );

    const map = new Map<string, InstructorStats>();
    for (const row of grouped) {
      map.set(row.instructorId, {
        coursesCount: row._count._all,
        studentsCount: row._sum.studentsCount ?? 0,
        reviewsCount: row._sum.ratingCount ?? 0,
        ratingAvg: ratingMap.get(row.instructorId) ?? 0,
      });
    }
    return map;
  }

  private async computeAggregatesForOne(
    instructorId: string,
  ): Promise<InstructorStats> {
    const all = await this.computeAggregatesForAll();
    return all.get(instructorId) ?? this.emptyStats();
  }

  private emptyStats(): InstructorStats {
    return { coursesCount: 0, studentsCount: 0, ratingAvg: 0, reviewsCount: 0 };
  }

  private compareBySort(
    a: { stats: InstructorStats; createdAt: Date },
    b: { stats: InstructorStats; createdAt: Date },
    sort: InstructorSort,
  ): number {
    switch (sort) {
      case 'new':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'rating':
        return b.stats.ratingAvg - a.stats.ratingAvg;
      case 'popular':
      default:
        return b.stats.studentsCount - a.stats.studentsCount;
    }
  }
}
