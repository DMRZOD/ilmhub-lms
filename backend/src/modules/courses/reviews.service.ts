import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import type { CreateReviewDto } from './dto/create-review.dto';
import type { UpdateReviewDto } from './dto/update-review.dto';
import type { ReviewSort } from './dto/list-reviews.dto';

const REVIEW_USER_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
} as const;

const REVIEW_SELECT = {
  id: true,
  userId: true,
  rating: true,
  comment: true,
  replyComment: true,
  repliedAt: true,
  helpfulCount: true,
  createdAt: true,
  updatedAt: true,
  user: { select: REVIEW_USER_SELECT },
} as const;

/** Owners may edit/delete their review within this window. */
const EDIT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

type ReviewRow = Prisma.ReviewGetPayload<{ select: typeof REVIEW_SELECT }>;

interface ListReviewsOptions {
  rating?: number;
  sort?: ReviewSort;
  viewerId?: string | null;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Recompute Course.ratingAvg / ratingCount from its reviews. */
  private async recalcCourseRating(
    tx: Prisma.TransactionClient,
    courseId: string,
  ) {
    const agg = await tx.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await tx.course.update({
      where: { id: courseId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count._all,
      },
    });
  }

  private orderByFor(sort: ReviewSort): Prisma.ReviewOrderByWithRelationInput[] {
    switch (sort) {
      case 'newest':
        return [{ createdAt: 'desc' }];
      case 'oldest':
        return [{ createdAt: 'asc' }];
      case 'highest':
        return [{ rating: 'desc' }, { createdAt: 'desc' }];
      case 'lowest':
        return [{ rating: 'asc' }, { createdAt: 'desc' }];
      case 'helpful':
      default:
        return [{ helpfulCount: 'desc' }, { createdAt: 'desc' }];
    }
  }

  private toDto(row: ReviewRow, viewerId: string | null, votedIds: Set<string>) {
    return {
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      replyComment: row.replyComment,
      repliedAt: row.repliedAt,
      helpfulCount: row.helpfulCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user,
      viewerHasVoted: votedIds.has(row.id),
      isOwn: viewerId != null && row.userId === viewerId,
    };
  }

  async list(
    courseId: string,
    page: number,
    limit: number,
    opts: ListReviewsOptions = {},
  ) {
    const { rating, sort = 'helpful', viewerId = null } = opts;
    const where: Prisma.ReviewWhereInput = {
      courseId,
      ...(rating ? { rating: { gte: rating } } : {}),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        select: REVIEW_SELECT,
        orderBy: this.orderByFor(sort),
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    let votedIds = new Set<string>();
    if (viewerId && rows.length > 0) {
      const votes = await this.prisma.reviewHelpful.findMany({
        where: { userId: viewerId, reviewId: { in: rows.map((r) => r.id) } },
        select: { reviewId: true },
      });
      votedIds = new Set(votes.map((v) => v.reviewId));
    }

    return paginate(
      rows.map((r) => this.toDto(r, viewerId, votedIds)),
      total,
      page,
      limit,
    );
  }

  async listBySlug(
    slug: string,
    page: number,
    limit: number,
    opts: ListReviewsOptions = {},
  ) {
    const course = await this.prisma.course.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (!course) throw new NotFoundException('course_not_found');
    return this.list(course.id, page, limit, opts);
  }

  async create(
    slug: string,
    user: { id: string; emailVerified: boolean },
    dto: CreateReviewDto,
  ) {
    const course = await this.prisma.course.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (!course) throw new NotFoundException('course_not_found');

    if (!user.emailVerified) {
      throw new ForbiddenException('email_not_verified');
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId: user.id, courseId: course.id, revokedAt: null },
      select: { id: true },
    });
    if (!enrollment) {
      throw new ForbiddenException('not_enrolled');
    }

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const row = await tx.review.create({
          data: {
            userId: user.id,
            courseId: course.id,
            rating: dto.rating,
            comment: dto.comment ?? null,
          },
          select: REVIEW_SELECT,
        });
        await this.recalcCourseRating(tx, course.id);
        return row;
      });
      return this.toDto(created, user.id, new Set());
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('already_reviewed');
      }
      throw err;
    }
  }

  async update(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true, courseId: true, createdAt: true },
    });
    if (!review) throw new NotFoundException('review_not_found');
    if (review.userId !== userId) throw new ForbiddenException('not_your_review');
    if (Date.now() - review.createdAt.getTime() > EDIT_WINDOW_MS) {
      throw new ForbiddenException('edit_window_expired');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.review.update({
        where: { id: reviewId },
        data: { rating: dto.rating, comment: dto.comment ?? null },
        select: REVIEW_SELECT,
      });
      await this.recalcCourseRating(tx, review.courseId);
      return row;
    });
    return this.toDto(updated, userId, new Set());
  }

  async remove(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true, courseId: true, createdAt: true },
    });
    if (!review) throw new NotFoundException('review_not_found');
    if (review.userId !== userId) throw new ForbiddenException('not_your_review');
    if (Date.now() - review.createdAt.getTime() > EDIT_WINDOW_MS) {
      throw new ForbiddenException('edit_window_expired');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      await this.recalcCourseRating(tx, review.courseId);
    });
    return { id: reviewId, deleted: true };
  }

  async addHelpful(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true },
    });
    if (!review) throw new NotFoundException('review_not_found');
    if (review.userId === userId) {
      throw new ForbiddenException('cannot_vote_own');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        await tx.reviewHelpful.create({ data: { reviewId, userId } });
        return tx.review.update({
          where: { id: reviewId },
          data: { helpfulCount: { increment: 1 } },
          select: { id: true, helpfulCount: true },
        });
      });
      return { ...result, viewerHasVoted: true };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        // Already voted — idempotent no-op.
        const current = await this.prisma.review.findUnique({
          where: { id: reviewId },
          select: { id: true, helpfulCount: true },
        });
        return {
          id: reviewId,
          helpfulCount: current?.helpfulCount ?? 0,
          viewerHasVoted: true,
        };
      }
      throw err;
    }
  }

  async removeHelpful(userId: string, reviewId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.reviewHelpful.deleteMany({
        where: { reviewId, userId },
      });
      if (count === 0) {
        const current = await tx.review.findUnique({
          where: { id: reviewId },
          select: { id: true, helpfulCount: true },
        });
        if (!current) throw new NotFoundException('review_not_found');
        return current;
      }
      return tx.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { decrement: 1 } },
        select: { id: true, helpfulCount: true },
      });
    });
    return { ...result, viewerHasVoted: false };
  }

  async report(userId: string, reviewId: string, reason: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true },
    });
    if (!review) throw new NotFoundException('review_not_found');
    if (review.userId === userId) {
      throw new ForbiddenException('cannot_report_own');
    }

    try {
      const created = await this.prisma.reviewReport.create({
        data: { reviewId, reporterId: userId, reason },
        select: { id: true, status: true, createdAt: true },
      });
      return created;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('already_reported');
      }
      throw err;
    }
  }
}
