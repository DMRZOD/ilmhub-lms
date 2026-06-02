import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MuxPlaybackPolicy } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { CertificatesService } from '../certificates/certificates.service';
import { MuxService } from './mux.service';
import { LessonProgressDto } from './dto/lesson-progress.dto';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly enrollments: EnrollmentsService,
    private readonly certificates: CertificatesService,
    private readonly mux: MuxService,
  ) {}

  async findOneForUser(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: {
              select: { id: true, slug: true, title: true, lessonsCount: true },
            },
          },
        },
      },
    });
    if (!lesson) throw new NotFoundException('lesson_not_found');

    const courseId = lesson.section.course.id;
    const enrolled = await this.enrollments.isUserEnrolled(userId, courseId);
    if (!enrolled && !lesson.isPreview) {
      throw new ForbiddenException('not_enrolled');
    }

    const curriculum = await this.loadCourseCurriculum(courseId);
    const progressRows = await this.prisma.lessonProgress.findMany({
      where: { userId, lesson: { section: { courseId } } },
      select: {
        lessonId: true,
        completedAt: true,
        lastPositionSeconds: true,
      },
    });
    const progressMap = new Map(progressRows.map((p) => [p.lessonId, p]));
    const myProgress = progressMap.get(lessonId) ?? null;

    const sections = curriculum.map((section) => ({
      id: section.id,
      title: section.title,
      order: section.order,
      lessons: section.lessons.map((l) => {
        const p = progressMap.get(l.id);
        return {
          id: l.id,
          title: l.title,
          order: l.order,
          type: l.type,
          durationSeconds: l.durationSeconds,
          isPreview: l.isPreview,
          completed: Boolean(p?.completedAt),
          locked: !enrolled && !l.isPreview,
        };
      }),
    }));

    const flat = sections.flatMap((s) => s.lessons);
    const idx = flat.findIndex((l) => l.id === lessonId);
    const prevLessonId = idx > 0 ? flat[idx - 1].id : null;
    const nextLessonId = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1].id : null;
    const completedCount = flat.filter((l) => l.completed).length;
    const progressPercent =
      flat.length > 0 ? Math.round((completedCount / flat.length) * 100) : 0;

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order,
      type: lesson.type,
      durationSeconds: lesson.durationSeconds,
      isPreview: lesson.isPreview,
      muxPlaybackId: lesson.muxPlaybackId,
      muxPlaybackPolicy: lesson.muxPlaybackPolicy,
      articleContent: lesson.articleContent,
      resources: lesson.resources,
      section: {
        id: lesson.section.id,
        title: lesson.section.title,
        order: lesson.section.order,
      },
      course: {
        id: lesson.section.course.id,
        slug: lesson.section.course.slug,
        title: lesson.section.course.title,
        lessonsCount: lesson.section.course.lessonsCount,
        sections,
        progressPercent,
        completedCount,
        totalLessons: flat.length,
      },
      myProgress: myProgress
        ? {
            lastPositionSeconds: myProgress.lastPositionSeconds,
            completed: Boolean(myProgress.completedAt),
            completedAt: myProgress.completedAt?.toISOString() ?? null,
          }
        : { lastPositionSeconds: 0, completed: false, completedAt: null },
      navigation: { prevLessonId, nextLessonId },
      enrolled,
    };
  }

  async createPlaybackToken(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        isPreview: true,
        muxPlaybackId: true,
        muxPlaybackPolicy: true,
        section: { select: { courseId: true } },
      },
    });
    if (!lesson) throw new NotFoundException('lesson_not_found');
    if (!lesson.muxPlaybackId) {
      throw new NotFoundException('lesson_video_not_available');
    }

    const enrolled = await this.enrollments.isUserEnrolled(
      userId,
      lesson.section.courseId,
    );
    if (!enrolled && !lesson.isPreview) {
      throw new ForbiddenException('not_enrolled');
    }

    if (lesson.muxPlaybackPolicy === MuxPlaybackPolicy.PUBLIC) {
      return {
        playbackId: lesson.muxPlaybackId,
        policy: lesson.muxPlaybackPolicy,
        token: null,
        expiresAt: null,
      };
    }

    const signed = await this.mux.signPlaybackId(lesson.muxPlaybackId);
    return {
      playbackId: lesson.muxPlaybackId,
      policy: lesson.muxPlaybackPolicy,
      token: signed.token,
      expiresAt: signed.expiresAt,
    };
  }

  async recordProgress(
    userId: string,
    lessonId: string,
    dto: LessonProgressDto,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, section: { select: { courseId: true } } },
    });
    if (!lesson) throw new NotFoundException('lesson_not_found');

    const courseId = lesson.section.courseId;
    const enrolled = await this.enrollments.isUserEnrolled(userId, courseId);
    if (!enrolled) throw new ForbiddenException('not_enrolled');

    const markCompleted = dto.completed === true;
    const now = new Date();

    await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        lastPositionSeconds: dto.positionSeconds,
        completedAt: markCompleted ? now : null,
      },
      update: {
        lastPositionSeconds: dto.positionSeconds,
        ...(markCompleted ? { completedAt: now } : {}),
      },
    });

    if (markCompleted) {
      await this.maybeCompleteCourse(userId, courseId);
    }

    return { ok: true };
  }

  /**
   * Marks a lesson completed without touching playback position. Used by
   * non-video completions (e.g. a passed quiz). Idempotent: completedAt is
   * only set once and the course-completion check runs each call.
   */
  async markLessonCompleted(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, section: { select: { courseId: true } } },
    });
    if (!lesson) throw new NotFoundException('lesson_not_found');

    const courseId = lesson.section.courseId;
    const enrolled = await this.enrollments.isUserEnrolled(userId, courseId);
    if (!enrolled) throw new ForbiddenException('not_enrolled');

    const now = new Date();
    await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, lastPositionSeconds: 0, completedAt: now },
      update: { completedAt: now },
    });

    await this.maybeCompleteCourse(userId, courseId);
    return { ok: true };
  }

  private async maybeCompleteCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { lessonsCount: true },
    });
    if (!course) return;

    const completedCount = await this.prisma.lessonProgress.count({
      where: {
        userId,
        completedAt: { not: null },
        lesson: { section: { courseId } },
      },
    });

    if (completedCount >= course.lessonsCount && course.lessonsCount > 0) {
      await this.prisma.enrollment.updateMany({
        where: { userId, courseId, completedAt: null },
        data: { completedAt: new Date() },
      });
      this.logger.log(
        `Course ${courseId} completed by user ${userId} — issuing certificate.`,
      );
      // Issue the certificate, but never let a failure here break lesson
      // completion. The PDF itself is generated lazily on first download.
      try {
        await this.certificates.issueForCompletion(userId, courseId);
      } catch (err) {
        this.logger.error(
          `Certificate issuance failed for user ${userId} / course ${courseId}: ${(err as Error).message}`,
        );
      }
    }
  }

  private async loadCourseCurriculum(courseId: string) {
    return this.prisma.section.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        order: true,
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            type: true,
            durationSeconds: true,
            isPreview: true,
          },
        },
      },
    });
  }
}
