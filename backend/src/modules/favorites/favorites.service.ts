import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  COURSE_CARD_INCLUDE,
  toCourseCard,
} from '../courses/course-card.mapper';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async listMy(userId: string, page: number, limit: number) {
    const where = { userId, kind: 'FAVORITE' as const };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.wishlist.count({ where }),
      this.prisma.wishlist.findMany({
        where,
        include: { course: { include: COURSE_CARD_INCLUDE } },
        orderBy: { addedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return paginate(
      rows.map((row) => toCourseCard(row.course)),
      total,
      page,
      limit,
    );
  }

  async add(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true },
    });
    if (!course || course.status !== 'PUBLISHED') {
      throw new NotFoundException('course_not_found');
    }
    await this.prisma.wishlist.upsert({
      where: {
        userId_courseId_kind: { userId, courseId, kind: 'FAVORITE' },
      },
      create: { userId, courseId, kind: 'FAVORITE' },
      update: {},
      select: { id: true },
    });
    return { ok: true, courseId };
  }

  async remove(userId: string, courseId: string) {
    await this.prisma.wishlist.deleteMany({
      where: { userId, courseId, kind: 'FAVORITE' },
    });
  }
}
