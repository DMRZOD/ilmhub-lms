import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import { paginate } from '../../common/dto/pagination.dto';
import { ListAdminCoursesDto } from './dto/list-admin-courses.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { buildPublishChecklist } from '../instructor-courses/publish-checklist';

const COURSE_DETAIL_INCLUDE = {
  instructor: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
  category: { select: { id: true, name: true, slug: true } },
  sections: {
    orderBy: { order: 'asc' as const },
    include: {
      lessons: {
        orderBy: { order: 'asc' as const },
        select: {
          id: true,
          title: true,
          type: true,
          order: true,
          durationSeconds: true,
          isPreview: true,
        },
      },
    },
  },
} satisfies Prisma.CourseInclude;

type CourseDetail = Prisma.CourseGetPayload<{
  include: typeof COURSE_DETAIL_INCLUDE;
}>;

const INSTRUCTOR_COURSES_LINK = '/instructor/courses';

@Injectable()
export class AdminCoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly audit: AuditService,
    private readonly notif: NotificationsService,
  ) {}

  // ---------- List ----------

  async list(query: ListAdminCoursesDto) {
    const { page, limit, status, q } = query;

    const where: Prisma.CourseWhereInput = {
      ...(status === 'ALL' ? { status: { not: 'DRAFT' } } : { status }),
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
    };

    const [total, courses] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          status: true,
          priceUsdCents: true,
          discountUsdCents: true,
          studentsCount: true,
          lessonsCount: true,
          durationMinutes: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
          instructor: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
    ]);

    const items = courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      thumbnailUrl: c.thumbnailUrl,
      status: c.status,
      priceUsdCents: c.priceUsdCents,
      discountUsdCents: c.discountUsdCents,
      studentsCount: c.studentsCount,
      lessonsCount: c.lessonsCount,
      durationMinutes: c.durationMinutes,
      instructor: c.instructor,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      publishedAt: c.publishedAt ? c.publishedAt.toISOString() : null,
    }));

    return paginate(items, total, page, limit);
  }

  // ---------- Detail (full course + moderation timeline) ----------

  async detail(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: COURSE_DETAIL_INCLUDE,
    });
    if (!course) throw new NotFoundException('course_not_found');

    const moderationLog = await this.audit.listForTarget('COURSE', id);
    return { ...this.shape(course), moderationLog };
  }

  // ---------- Moderation actions ----------

  async approve(id: string, adminId: string) {
    const course = await this.requireCourse(id);
    if (course.status === 'PUBLISHED') {
      throw new ConflictException('already_published');
    }
    await this.assertPublishable(id);

    await this.prisma.course.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: course.publishedAt ?? new Date(),
        rejectionReason: null,
      },
    });

    await this.notif.createAndNotify(course.instructorId, {
      type: NotificationType.COURSE_UPDATE,
      title: 'Kursingiz tasdiqlandi',
      body: `"${course.title}" kursi ko'rib chiqildi va nashr etildi. Tabriklaymiz!`,
      link: INSTRUCTOR_COURSES_LINK,
    });

    await this.email.sendCourseApprovedEmail(
      course.instructor.email,
      course.instructor.name,
      { title: course.title, link: INSTRUCTOR_COURSES_LINK },
    );

    await this.audit.log(adminId, 'COURSE_APPROVED', 'COURSE', id, {
      title: course.title,
    });

    return this.detail(id);
  }

  async reject(id: string, adminId: string, reason: string) {
    const course = await this.requireCourse(id);
    if (course.status !== 'PENDING_REVIEW') {
      throw new ConflictException('not_in_review');
    }

    await this.prisma.course.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason },
    });

    await this.notif.createAndNotify(course.instructorId, {
      type: NotificationType.COURSE_UPDATE,
      title: "Kursingiz qayta ko'rib chiqishni talab qiladi",
      body: `"${course.title}" kursi hozircha tasdiqlanmadi. Sabab: ${reason}`,
      link: INSTRUCTOR_COURSES_LINK,
    });

    await this.email.sendCourseRejectedEmail(
      course.instructor.email,
      course.instructor.name,
      { courseTitle: course.title, reason },
    );

    await this.audit.log(adminId, 'COURSE_REJECTED', 'COURSE', id, { reason });

    return this.detail(id);
  }

  async archive(id: string, adminId: string) {
    const course = await this.requireCourse(id);
    if (course.status === 'ARCHIVED') {
      throw new ConflictException('already_archived');
    }

    await this.prisma.$transaction([
      this.prisma.course.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      }),
      this.prisma.notification.create({
        data: {
          userId: course.instructorId,
          type: NotificationType.COURSE_UPDATE,
          title: 'Kursingiz arxivlandi',
          body: `"${course.title}" kursi arxivlandi va katalogdan olib tashlandi.`,
          link: INSTRUCTOR_COURSES_LINK,
        },
      }),
    ]);

    await this.audit.log(adminId, 'COURSE_ARCHIVED', 'COURSE', id, {
      title: course.title,
    });

    return this.detail(id);
  }

  async addNote(id: string, adminId: string, note: string) {
    await this.requireCourse(id);
    await this.audit.log(adminId, 'COURSE_NOTE', 'COURSE', id, { note });
    const moderationLog = await this.audit.listForTarget('COURSE', id);
    return { moderationLog };
  }

  // ---------- Helpers ----------

  /**
   * Re-run the publish checklist before publishing. A structural edit (e.g.
   * adding a CODING lesson with no exercise) auto-flips a PUBLISHED course back
   * to PENDING_REVIEW without going through the instructor submitForReview gate,
   * so without this an incomplete course could be approved straight to live.
   * Shares the exact rules used by submitForReview via buildPublishChecklist.
   */
  private async assertPublishable(id: string) {
    const course = await this.prisma.course.findUniqueOrThrow({
      where: { id },
      select: {
        title: true,
        thumbnailUrl: true,
        description: true,
        lessonsCount: true,
        sections: {
          select: {
            lessons: {
              select: {
                type: true,
                muxAssetStatus: true,
                articleContent: true,
                quiz: { select: { questions: { select: { id: true } } } },
                codingExercise: { select: { tests: true } },
              },
            },
          },
        },
      },
    });

    const missing = buildPublishChecklist(course)
      .filter((c) => !c.ok)
      .map((c) => c.key);
    if (missing.length > 0) {
      throw new BadRequestException({ error: 'incomplete_course', missing });
    }
  }

  private async requireCourse(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        instructorId: true,
        publishedAt: true,
        instructor: { select: { email: true, name: true } },
      },
    });
    if (!course) throw new NotFoundException('course_not_found');
    return course;
  }

  private shape(course: CourseDetail) {
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
      status: course.status,
      rejectionReason: course.rejectionReason,
      learningOutcomes: course.learningOutcomes,
      requirements: course.requirements,
      publishedAt: course.publishedAt ? course.publishedAt.toISOString() : null,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      instructor: course.instructor,
      category: course.category,
      sections: course.sections.map((s) => ({
        id: s.id,
        title: s.title,
        order: s.order,
        lessonsCount: s.lessonsCount,
        durationMinutes: s.durationMinutes,
        lessons: s.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          order: l.order,
          durationSeconds: l.durationSeconds,
          isPreview: l.isPreview,
        })),
      })),
    };
  }
}
