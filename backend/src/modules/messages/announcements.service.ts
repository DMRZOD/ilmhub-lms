import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnnouncementAudience, NotificationType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { paginate } from '../../common/dto/pagination.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly notifications: NotificationsService,
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

    const link = `/courses/${course.slug}`;

    const announcement = await this.prisma.$transaction(async (tx) => {
      await tx.notification.createMany({
        data: recipients.map((r) => ({
          userId: r.id,
          type: NotificationType.ANNOUNCEMENT,
          title: dto.subject,
          body: dto.body,
          link,
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
        link,
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
}
