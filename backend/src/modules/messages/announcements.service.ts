import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnnouncementAudience, NotificationType, UserRole } from '@prisma/client';

import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { paginate } from '../../common/dto/pagination.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly notifications: NotificationsService,
    private readonly enrollments: EnrollmentsService,
  ) {}

  async create(instructorId: string, dto: CreateAnnouncementDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      select: { id: true, instructorId: true, title: true, slug: true },
    });
    if (!course) throw new NotFoundException('course_not_found');
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('not_your_course');
    }

    // Resolve recipients from enrollments of this course.
    const enrollWhere =
      dto.audience === AnnouncementAudience.ALL
        ? { courseId: course.id }
        : { courseId: course.id, userId: { in: dto.userIds ?? [] } };

    const enrollments = await this.prisma.enrollment.findMany({
      where: enrollWhere,
      select: { user: { select: { id: true, name: true, email: true } } },
    });

    const recipients = enrollments.map((e) => e.user);
    if (recipients.length === 0) {
      throw new BadRequestException('no_recipients');
    }

    const courseLink = `/courses/${course.slug}`;
    // Udemy-style: a broadcast (ALL) opens each student's resume lesson with the
    // announcements tab. Targeted announcements keep the plain course link.
    const linkByUser =
      dto.audience === AnnouncementAudience.ALL
        ? await this.resolveResumeLinks(
            course.id,
            recipients.map((r) => r.id),
            courseLink,
          )
        : null;
    const linkFor = (userId: string) => linkByUser?.get(userId) ?? courseLink;

    const announcement = await this.prisma.$transaction(async (tx) => {
      await tx.notification.createMany({
        data: recipients.map((r) => ({
          userId: r.id,
          type: NotificationType.ANNOUNCEMENT,
          title: dto.subject,
          body: dto.body,
          link: linkFor(r.id),
        })),
      });

      return tx.announcement.create({
        data: {
          instructorId,
          courseId: course.id,
          subject: dto.subject,
          body: dto.body,
          audience: dto.audience,
          recipientCount: recipients.length,
        },
        select: {
          id: true,
          subject: true,
          body: true,
          audience: true,
          recipientCount: true,
          createdAt: true,
        },
      });
    });

    // Push SSE to connected recipients and fire emails.
    for (const r of recipients) {
      this.notifications.pushLive(r.id, {
        type: NotificationType.ANNOUNCEMENT,
        title: dto.subject,
        body: dto.body,
        link: linkFor(r.id),
      });
    }
    await Promise.all(
      recipients.map((r) =>
        this.email.sendAnnouncementEmail(r.email, r.name, {
          courseTitle: course.title,
          subject: dto.subject,
          body: dto.body,
        }),
      ),
    );

    return {
      ...announcement,
      createdAt: announcement.createdAt.toISOString(),
      course: { id: course.id, title: course.title, slug: course.slug },
    };
  }

  async list(instructorId: string, page: number, limit: number) {
    const where = { instructorId };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.announcement.count({ where }),
      this.prisma.announcement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          subject: true,
          body: true,
          audience: true,
          recipientCount: true,
          createdAt: true,
          courseId: true,
        },
      }),
    ]);

    const courseIds = [...new Set(rows.map((r) => r.courseId).filter(Boolean))] as string[];
    const courses = courseIds.length
      ? await this.prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true, title: true, slug: true },
        })
      : [];
    const courseById = new Map(courses.map((c) => [c.id, c]));

    const items = rows.map((r) => ({
      id: r.id,
      subject: r.subject,
      body: r.body,
      audience: r.audience,
      recipientCount: r.recipientCount,
      createdAt: r.createdAt.toISOString(),
      course: r.courseId ? courseById.get(r.courseId) ?? null : null,
    }));

    return paginate(items, total, page, limit);
  }

  /**
   * Student-facing read: broadcast (ALL) announcements of a course, newest
   * first. Targeted (ONE/SELECTED) announcements stay private to notifications.
   * Readable by the course owner, an admin, or an enrolled student.
   */
  async listForCourse(user: AuthenticatedUser, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true },
    });
    if (!course) throw new NotFoundException('course_not_found');

    const isOwnerOrAdmin =
      user.role === UserRole.ADMIN || user.id === course.instructorId;
    if (!isOwnerOrAdmin) {
      const enrolled = await this.enrollments.isUserEnrolled(user.id, courseId);
      if (!enrolled) throw new ForbiddenException('not_enrolled');
    }

    const rows = await this.prisma.announcement.findMany({
      where: { courseId, audience: AnnouncementAudience.ALL },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        subject: true,
        body: true,
        createdAt: true,
        instructor: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      subject: r.subject,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
      instructor: r.instructor,
    }));
  }

  /**
   * Resolve, per recipient, the lesson to resume at (first not-completed lesson
   * by section/lesson order, falling back to the course's first lesson) and
   * build a deep link into the player with the announcements tab open.
   * Batched: 2 queries total regardless of recipient count. Mirrors the
   * semantics of `resolveResumeLessonIds` but keyed by user for one course.
   */
  private async resolveResumeLinks(
    courseId: string,
    userIds: string[],
    fallbackLink: string,
  ): Promise<Map<string, string>> {
    const [lessons, completed] = await Promise.all([
      this.prisma.lesson.findMany({
        where: { section: { courseId } },
        orderBy: [{ section: { order: 'asc' } }, { order: 'asc' }],
        select: { id: true },
      }),
      this.prisma.lessonProgress.findMany({
        where: {
          userId: { in: userIds },
          completedAt: { not: null },
          lesson: { section: { courseId } },
        },
        select: { userId: true, lessonId: true },
      }),
    ]);

    const links = new Map<string, string>();
    if (lessons.length === 0) {
      for (const userId of userIds) links.set(userId, fallbackLink);
      return links;
    }

    const completedByUser = new Map<string, Set<string>>();
    for (const row of completed) {
      let set = completedByUser.get(row.userId);
      if (!set) {
        set = new Set<string>();
        completedByUser.set(row.userId, set);
      }
      set.add(row.lessonId);
    }

    const firstLessonId = lessons[0].id;
    for (const userId of userIds) {
      const done = completedByUser.get(userId);
      const resume = done
        ? lessons.find((l) => !done.has(l.id))?.id ?? firstLessonId
        : firstLessonId;
      links.set(userId, `/lesson/${resume}?tab=elonlar`);
    }
    return links;
  }
}
