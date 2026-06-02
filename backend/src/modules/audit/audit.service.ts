import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';

export type AuditAction =
  | 'USER_SUSPENDED'
  | 'USER_UNSUSPENDED'
  | 'USER_ROLE_CHANGED'
  | 'USER_DELETED'
  | 'USER_EMAILED'
  | 'INSTRUCTOR_APPROVED'
  | 'INSTRUCTOR_REJECTED'
  | 'COURSE_APPROVED'
  | 'COURSE_REJECTED'
  | 'COURSE_ARCHIVED'
  | 'COURSE_NOTE'
  | 'REFUND_APPROVED'
  | 'REFUND_REJECTED'
  // Step 35 — CMS / Blog / Settings
  | 'BLOG_CREATED'
  | 'BLOG_UPDATED'
  | 'BLOG_PUBLISHED'
  | 'BLOG_UNPUBLISHED'
  | 'BLOG_DELETED'
  | 'CMS_CATEGORY_CREATED'
  | 'CMS_CATEGORY_UPDATED'
  | 'CMS_CATEGORY_DELETED'
  | 'CMS_ACHIEVEMENT_CREATED'
  | 'CMS_ACHIEVEMENT_UPDATED'
  | 'CMS_ACHIEVEMENT_DELETED'
  | 'CMS_TESTIMONIAL_CREATED'
  | 'CMS_TESTIMONIAL_UPDATED'
  | 'CMS_TESTIMONIAL_DELETED'
  | 'CMS_FAQ_CREATED'
  | 'CMS_FAQ_UPDATED'
  | 'CMS_FAQ_DELETED'
  | 'CMS_HOME_UPDATED'
  | 'SETTINGS_UPDATED'
  // Step 37 — Review moderation
  | 'REVIEW_REPORT_DISMISSED'
  | 'REVIEW_REMOVED';

export type AuditTargetType =
  | 'USER'
  | 'INSTRUCTOR_APPLICATION'
  | 'COURSE'
  | 'REFUND_REQUEST'
  // Step 35
  | 'BLOG_POST'
  | 'BLOG_CATEGORY'
  | 'CATEGORY'
  | 'ACHIEVEMENT'
  | 'TESTIMONIAL'
  | 'FAQ'
  | 'HOME_CONTENT'
  | 'SETTING'
  // Step 37
  | 'REVIEW'
  | 'REVIEW_REPORT';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Record an administrative action in the audit log. */
  async log(
    actorId: string,
    action: AuditAction,
    targetType: AuditTargetType,
    targetId?: string | null,
    metadata: Prisma.InputJsonValue = {},
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId: targetId ?? null,
        metadata,
      },
    });
  }

  /** Recent audit entries for a given target, newest first, with actor info. */
  async listForTarget(
    targetType: AuditTargetType,
    targetId: string,
    limit = 20,
  ) {
    const rows = await this.prisma.auditLog.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        metadata: true,
        createdAt: true,
        actor: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      metadata: row.metadata,
      createdAt: row.createdAt.toISOString(),
      actor: row.actor,
    }));
  }

  /** Paginated platform-wide audit feed for the admin viewer, newest first. */
  async listRecent(params: {
    page: number;
    limit: number;
    action?: string;
    targetType?: string;
  }) {
    const { page, limit, action, targetType } = params;
    const where = {
      ...(action ? { action } : {}),
      ...(targetType ? { targetType } : {}),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          action: true,
          targetType: true,
          targetId: true,
          metadata: true,
          createdAt: true,
          actor: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
    ]);

    const items = rows.map((row) => ({
      id: row.id,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      metadata: row.metadata,
      createdAt: row.createdAt.toISOString(),
      actor: row.actor,
    }));

    return paginate(items, total, page, limit);
  }
}
