import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  ENROLLMENT_COURSE_INCLUDE,
  toEnrolledCourse,
  type EnrolledCourseDto,
} from './enrollment.mapper';
import { resolveResumeLessonIds } from './resume-lesson.util';
import type {
  EnrollmentSort,
  EnrollmentStatusFilter,
  ListEnrollmentsDto,
} from './dto/list-enrollments.dto';

interface AggregatedEnrollment {
  dto: EnrolledCourseDto;
  rawProgress: number;
  rawEnrolledAt: number;
  rawLastAccessedAt: number;
}

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true, priceUsdCents: true },
    });
    if (!course || course.status !== 'PUBLISHED') {
      throw new NotFoundException('course_not_found');
    }
    if (course.priceUsdCents > 0) {
      throw new ForbiddenException('payment_required');
    }

    const firstLessonId = await this.findFirstLessonId(courseId);

    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true, enrolledAt: true, completedAt: true, revokedAt: true },
    });
    if (existing && !existing.revokedAt) {
      return {
        id: existing.id,
        courseId,
        enrolledAt: existing.enrolledAt.toISOString(),
        completedAt: existing.completedAt?.toISOString() ?? null,
        alreadyEnrolled: true,
        firstLessonId,
        nextLessonId: await this.findNextLessonId(userId, courseId, firstLessonId),
      };
    }
    if (existing) {
      // Reactivate a previously revoked (refunded) enrollment.
      const [reactivated] = await this.prisma.$transaction([
        this.prisma.enrollment.update({
          where: { id: existing.id },
          data: { revokedAt: null },
          select: { id: true, enrolledAt: true, completedAt: true },
        }),
        this.prisma.course.update({
          where: { id: courseId },
          data: { studentsCount: { increment: 1 } },
          select: { id: true },
        }),
      ]);
      return {
        id: reactivated.id,
        courseId,
        enrolledAt: reactivated.enrolledAt.toISOString(),
        completedAt: reactivated.completedAt?.toISOString() ?? null,
        alreadyEnrolled: false,
        firstLessonId,
        nextLessonId: await this.findNextLessonId(userId, courseId, firstLessonId),
      };
    }

    const [enrollment] = await this.prisma.$transaction([
      this.prisma.enrollment.create({
        data: { userId, courseId },
        select: { id: true, enrolledAt: true, completedAt: true },
      }),
      this.prisma.course.update({
        where: { id: courseId },
        data: { studentsCount: { increment: 1 } },
        select: { id: true },
      }),
    ]);

    return {
      id: enrollment.id,
      courseId,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      completedAt: enrollment.completedAt?.toISOString() ?? null,
      alreadyEnrolled: false,
      firstLessonId,
      nextLessonId: firstLessonId,
    };
  }

  /**
   * Idempotently grant a user access to a course, bypassing the price guard.
   * Intended for the paid flow (called after a successful order/payment).
   * Runs inside the caller's transaction so the whole fulfillment stays atomic.
   */
  async grantEnrollment(
    tx: Prisma.TransactionClient,
    userId: string,
    courseId: string,
  ): Promise<void> {
    const existing = await tx.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true, revokedAt: true },
    });
    if (existing && !existing.revokedAt) return;

    if (existing) {
      // Re-grant access after a prior refund/revocation.
      await tx.enrollment.update({
        where: { id: existing.id },
        data: { revokedAt: null },
        select: { id: true },
      });
    } else {
      await tx.enrollment.create({
        data: { userId, courseId },
        select: { id: true },
      });
    }
    await tx.course.update({
      where: { id: courseId },
      data: { studentsCount: { increment: 1 } },
      select: { id: true },
    });
  }

  /**
   * Soft-revoke a user's access to a course (used by the refund flow). Runs
   * inside the caller's transaction; idempotent — a missing or already-revoked
   * enrollment is a no-op so studentsCount never double-decrements.
   */
  async revokeEnrollment(
    tx: Prisma.TransactionClient,
    userId: string,
    courseId: string,
  ): Promise<void> {
    const existing = await tx.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true, revokedAt: true },
    });
    if (!existing || existing.revokedAt) return;

    await tx.enrollment.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
      select: { id: true },
    });
    await tx.course.update({
      where: { id: courseId },
      data: { studentsCount: { decrement: 1 } },
      select: { id: true },
    });
  }

  async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    const row = await this.prisma.enrollment.findFirst({
      where: { userId, courseId, revokedAt: null },
      select: { id: true },
    });
    return Boolean(row);
  }

  private async findFirstLessonId(courseId: string): Promise<string | null> {
    const lesson = await this.prisma.lesson.findFirst({
      where: { section: { courseId } },
      orderBy: [{ section: { order: 'asc' } }, { order: 'asc' }],
      select: { id: true },
    });
    return lesson?.id ?? null;
  }

  private async findNextLessonId(
    userId: string,
    courseId: string,
    fallbackId: string | null,
  ): Promise<string | null> {
    const next = await this.prisma.lesson.findFirst({
      where: {
        section: { courseId },
        progress: { none: { userId, completedAt: { not: null } } },
      },
      orderBy: [{ section: { order: 'asc' } }, { order: 'asc' }],
      select: { id: true },
    });
    return next?.id ?? fallbackId;
  }

  async listMy(userId: string, query: ListEnrollmentsDto) {
    const rows = await this.prisma.enrollment.findMany({
      where: { userId, revokedAt: null },
      include: ENROLLMENT_COURSE_INCLUDE,
      orderBy: { enrolledAt: 'desc' },
    });

    if (rows.length === 0) {
      return paginate<EnrolledCourseDto>([], 0, query.page, query.limit);
    }

    const courseIds = rows.map((r) => r.courseId);

    const resumeByCourse = await resolveResumeLessonIds(
      this.prisma,
      userId,
      courseIds,
    );

    const progressRows = await this.prisma.lessonProgress.findMany({
      where: {
        userId,
        lesson: { section: { courseId: { in: courseIds } } },
      },
      select: {
        completedAt: true,
        updatedAt: true,
        lesson: { select: { section: { select: { courseId: true } } } },
      },
    });

    const reviewedRows = await this.prisma.review.findMany({
      where: { userId, courseId: { in: courseIds } },
      select: { courseId: true },
    });
    const reviewedCourses = new Set(reviewedRows.map((r) => r.courseId));

    const completedByCourse = new Map<string, number>();
    const lastAccessedByCourse = new Map<string, Date>();
    for (const row of progressRows) {
      const cid = row.lesson.section.courseId;
      if (row.completedAt) {
        completedByCourse.set(cid, (completedByCourse.get(cid) ?? 0) + 1);
      }
      const prev = lastAccessedByCourse.get(cid);
      if (!prev || row.updatedAt > prev) {
        lastAccessedByCourse.set(cid, row.updatedAt);
      }
    }

    const aggregated: AggregatedEnrollment[] = rows.map((row) => {
      const total = row.course.lessonsCount;
      const completed = completedByCourse.get(row.courseId) ?? 0;
      const progressPercent =
        total > 0 ? Math.round((completed / total) * 100) : 0;
      const lastAccessedAt =
        lastAccessedByCourse.get(row.courseId) ?? null;
      const dto = toEnrolledCourse(
        row,
        progressPercent,
        lastAccessedAt,
        reviewedCourses.has(row.courseId),
        resumeByCourse.get(row.courseId) ?? null,
      );
      return {
        dto,
        rawProgress: progressPercent,
        rawEnrolledAt: row.enrolledAt.getTime(),
        rawLastAccessedAt: (lastAccessedAt ?? row.enrolledAt).getTime(),
      };
    });

    const filtered = aggregated.filter((a) =>
      matchesStatus(a, query.status, rows),
    );

    sortInPlace(filtered, query.sort);

    const total = filtered.length;
    const start = (query.page - 1) * query.limit;
    const items = filtered.slice(start, start + query.limit).map((a) => a.dto);

    return paginate<EnrolledCourseDto>(items, total, query.page, query.limit);
  }
}

function matchesStatus(
  agg: AggregatedEnrollment,
  status: EnrollmentStatusFilter,
  rows: { id: string; completedAt: Date | null }[],
): boolean {
  if (status === 'all') return true;
  const row = rows.find((r) => r.id === agg.dto.id);
  const isCompleted = Boolean(row?.completedAt);
  if (status === 'completed') return isCompleted;
  if (status === 'notStarted') return !isCompleted && agg.rawProgress === 0;
  return !isCompleted && agg.rawProgress > 0;
}

function sortInPlace(
  list: AggregatedEnrollment[],
  sort: EnrollmentSort,
): void {
  switch (sort) {
    case 'enrolled':
      list.sort((a, b) => b.rawEnrolledAt - a.rawEnrolledAt);
      return;
    case 'progress':
      list.sort((a, b) => b.rawProgress - a.rawProgress);
      return;
    case 'recent':
    default:
      list.sort((a, b) => b.rawLastAccessedAt - a.rawLastAccessedAt);
  }
}
