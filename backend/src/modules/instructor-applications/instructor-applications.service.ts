import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, type InstructorApplication } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import { paginate } from '../../common/dto/pagination.dto';
import { CreateInstructorApplicationDto } from './dto/create-instructor-application.dto';
import { ListInstructorApplicationsDto } from './dto/list-instructor-applications.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InstructorApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly audit: AuditService,
    private readonly notif: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateInstructorApplicationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('user_not_found');
    if (user.role !== 'STUDENT') {
      throw new ConflictException('already_instructor');
    }

    const existing = await this.prisma.instructorApplication.findUnique({
      where: { userId },
      select: { status: true },
    });
    if (existing && existing.status !== 'REJECTED') {
      throw new ConflictException('application_already_exists');
    }

    const data = {
      bio: dto.bio,
      expertise: dto.expertise.join(', '),
      sampleWorkUrls: dto.links ?? [],
      status: 'PENDING' as const,
      rejectedReason: null,
      decidedAt: null,
      decidedById: null,
    };

    const application = await this.prisma.instructorApplication.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return this.toDto(application);
  }

  async getMine(userId: string) {
    const application = await this.prisma.instructorApplication.findUnique({
      where: { userId },
    });
    return application ? this.toDto(application) : null;
  }

  async list(query: ListInstructorApplicationsDto) {
    const where = query.status ? { status: query.status } : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.instructorApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          applicant: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.instructorApplication.count({ where }),
    ]);

    const items = rows.map((row) => ({
      ...this.toDto(row),
      applicant: row.applicant,
    }));
    return paginate(items, total, query.page, query.limit);
  }

  async approve(id: string, adminId: string) {
    const application = await this.requirePending(id);

    const [updated] = await this.prisma.$transaction([
      this.prisma.instructorApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          decidedAt: new Date(),
          decidedById: adminId,
          rejectedReason: null,
        },
      }),
      this.prisma.user.update({
        where: { id: application.userId },
        data: { role: 'INSTRUCTOR' },
      }),
    ]);

    await this.notif.createAndNotify(application.userId, {
      type: NotificationType.GENERAL,
      title: 'Arizangiz tasdiqlandi',
      body: "Tabriklaymiz! Endi siz IlmHub'da ustozsiz va o'z kurslaringizni yaratishingiz mumkin.",
      link: '/instructor/dashboard',
    });

    const applicant = await this.prisma.user.findUnique({
      where: { id: application.userId },
      select: { email: true, name: true },
    });
    if (applicant) {
      await this.email.sendInstructorWelcomeEmail(applicant.email, applicant.name);
    }
    await this.audit.log(adminId, 'INSTRUCTOR_APPROVED', 'INSTRUCTOR_APPLICATION', id, {
      userId: application.userId,
    });

    return this.toDto(updated);
  }

  async reject(id: string, adminId: string, reason: string) {
    const application = await this.requirePending(id);

    const [updated] = await this.prisma.$transaction([
      this.prisma.instructorApplication.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedReason: reason,
          decidedAt: new Date(),
          decidedById: adminId,
        },
      }),
    ]);

    await this.notif.createAndNotify(application.userId, {
      type: NotificationType.GENERAL,
      title: 'Arizangiz rad etildi',
      body: `Afsuski, ustoz bo'lish arizangiz rad etildi. Sabab: ${reason}`,
      link: '/student/become-instructor',
    });

    await this.audit.log(adminId, 'INSTRUCTOR_REJECTED', 'INSTRUCTOR_APPLICATION', id, {
      userId: application.userId,
      reason,
    });

    return this.toDto(updated);
  }

  private async requirePending(id: string) {
    const application = await this.prisma.instructorApplication.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });
    if (!application) throw new NotFoundException('application_not_found');
    if (application.status !== 'PENDING') {
      throw new ConflictException('application_already_decided');
    }
    return application;
  }

  private toDto(application: InstructorApplication) {
    return {
      id: application.id,
      userId: application.userId,
      status: application.status,
      bio: application.bio,
      expertise: application.expertise,
      sampleWorkUrls: Array.isArray(application.sampleWorkUrls)
        ? (application.sampleWorkUrls as string[])
        : [],
      rejectedReason: application.rejectedReason,
      decidedAt: application.decidedAt
        ? application.decidedAt.toISOString()
        : null,
      createdAt: application.createdAt.toISOString(),
    };
  }
}
