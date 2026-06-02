import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import {
  paginate,
  type PaginatedResult,
} from '../../common/dto/pagination.dto';
import {
  COURSE_CARD_INCLUDE,
  toCourseCard,
} from '../courses/course-card.mapper';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findBySlug(slug: string, page: number, limit: number) {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) throw new NotFoundException('category_not_found');

    const where = { categoryId: category.id, status: 'PUBLISHED' as const };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        include: COURSE_CARD_INCLUDE,
        orderBy: [{ publishedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const courses: PaginatedResult<ReturnType<typeof toCourseCard>> = paginate(
      rows.map(toCourseCard),
      total,
      page,
      limit,
    );

    return { category, courses };
  }
}
