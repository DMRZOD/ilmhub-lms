import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { COURSE_CARD_INCLUDE, toCourseCard } from './course-card.mapper';
import type { CourseSort, ListCoursesDto } from './dto/list-courses.dto';
import { ReviewsService } from './reviews.service';

const PUBLISHED_BASE: Prisma.CourseWhereInput = { status: 'PUBLISHED' };

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reviews: ReviewsService,
  ) {}

  async list(query: ListCoursesDto) {
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query.sort);
    const { page, limit } = query;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        include: COURSE_CARD_INCLUDE,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return paginate(rows.map(toCourseCard), total, page, limit);
  }

  async featured(limit: number) {
    const rows = await this.prisma.course.findMany({
      where: PUBLISHED_BASE,
      include: COURSE_CARD_INCLUDE,
      orderBy: [{ studentsCount: 'desc' }, { ratingAvg: 'desc' }],
      take: limit,
    });
    return rows.map(toCourseCard);
  }

  async findBySlug(slug: string, viewerId: string | null) {
    const course = await this.prisma.course.findFirst({
      where: { slug, ...PUBLISHED_BASE },
      include: {
        instructor: {
          select: { id: true, name: true, avatarUrl: true, bio: true },
        },
        category: {
          select: { id: true, slug: true, name: true, iconName: true },
        },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                order: true,
                type: true,
                durationSeconds: true,
                isPreview: true,
                videoAssetId: true,
              },
            },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('course_not_found');

    const [enrollment, isFavorited] = viewerId
      ? await Promise.all([
          this.prisma.enrollment.findFirst({
            where: { userId: viewerId, courseId: course.id, revokedAt: null },
            select: { id: true, completedAt: true },
          }),
          this.prisma.wishlist
            .findUnique({
              where: {
                userId_courseId_kind: {
                  userId: viewerId,
                  courseId: course.id,
                  kind: 'FAVORITE',
                },
              },
              select: { id: true },
            })
            .then(Boolean),
        ])
      : [null, false];
    const isEnrolled = Boolean(enrollment);

    const sections = course.sections.map((section) => ({
      id: section.id,
      title: section.title,
      order: section.order,
      lessonsCount: section.lessonsCount,
      durationMinutes: section.durationMinutes,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        type: lesson.type,
        durationSeconds: lesson.durationSeconds,
        isPreview: lesson.isPreview,
        videoAssetId:
          isEnrolled || lesson.isPreview ? lesson.videoAssetId : null,
      })),
    }));

    const reviews = await this.reviews.list(course.id, 1, 5);

    const currentUserProgress =
      viewerId && isEnrolled
        ? await this.buildCurrentUserProgress(viewerId, course.id, sections, enrollment)
        : null;

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      longDescription: course.longDescription,
      thumbnailUrl: course.thumbnailUrl,
      previewVideoUrl: course.previewVideoUrl,
      level: course.level,
      language: course.language,
      priceUsdCents: course.priceUsdCents,
      discountUsdCents: course.discountUsdCents,
      durationMinutes: course.durationMinutes,
      lessonsCount: course.lessonsCount,
      studentsCount: course.studentsCount,
      ratingAvg: Number(course.ratingAvg),
      ratingCount: course.ratingCount,
      learningOutcomes: course.learningOutcomes,
      requirements: course.requirements,
      publishedAt: course.publishedAt,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      instructor: course.instructor,
      category: course.category,
      sections,
      reviews,
      isEnrolled,
      isFavorited,
      currentUserProgress,
    };
  }

  private async buildCurrentUserProgress(
    viewerId: string,
    courseId: string,
    sections: Array<{ lessons: Array<{ id: string; title: string }> }>,
    enrollment: { completedAt: Date | null } | null,
  ) {
    const flat = sections.flatMap((s) => s.lessons);
    if (flat.length === 0) {
      return {
        lastLessonId: null,
        lastLessonTitle: null,
        progressPercent: 0,
        completedAt: enrollment?.completedAt?.toISOString() ?? null,
      };
    }

    const lessonIds = flat.map((l) => l.id);
    const [completedCount, latest] = await Promise.all([
      this.prisma.lessonProgress.count({
        where: {
          userId: viewerId,
          completedAt: { not: null },
          lessonId: { in: lessonIds },
        },
      }),
      this.prisma.lessonProgress.findFirst({
        where: { userId: viewerId, lessonId: { in: lessonIds } },
        orderBy: { updatedAt: 'desc' },
        select: { lessonId: true },
      }),
    ]);

    const fallback = flat[0];
    const lastLesson = latest
      ? flat.find((l) => l.id === latest.lessonId) ?? fallback
      : fallback;
    const progressPercent = Math.round((completedCount / flat.length) * 100);

    return {
      lastLessonId: lastLesson.id,
      lastLessonTitle: lastLesson.title,
      progressPercent,
      completedAt: enrollment?.completedAt?.toISOString() ?? null,
    };
  }

  private buildWhere(query: ListCoursesDto): Prisma.CourseWhereInput {
    const where: Prisma.CourseWhereInput = { ...PUBLISHED_BASE };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { subtitle: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }
    if (query.level?.length) {
      where.level = { in: query.level };
    }
    if (query.language?.length) {
      where.language = { in: query.language };
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.priceUsdCents = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }
    if (query.minRating !== undefined) {
      where.ratingAvg = { gte: query.minRating };
    }
    if (query.minDuration !== undefined || query.maxDuration !== undefined) {
      where.durationMinutes = {
        ...(query.minDuration !== undefined ? { gte: query.minDuration } : {}),
        ...(query.maxDuration !== undefined ? { lte: query.maxDuration } : {}),
      };
    }
    return where;
  }

  private buildOrderBy(
    sort: CourseSort,
  ): Prisma.CourseOrderByWithRelationInput[] {
    switch (sort) {
      case 'new':
        return [{ publishedAt: 'desc' }];
      case 'rating':
        return [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }];
      case 'price-asc':
        return [{ priceUsdCents: 'asc' }];
      case 'price-desc':
        return [{ priceUsdCents: 'desc' }];
      case 'popular':
      default:
        return [{ studentsCount: 'desc' }, { ratingAvg: 'desc' }];
    }
  }
}
