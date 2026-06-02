import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationType } from '@prisma/client';
import { Observable, Subject } from 'rxjs';
import type { MessageEvent } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import type { CreateNotificationDto } from './dto/create-notification.dto';
import type { ListNotificationsDto } from './dto/list-notifications.dto';
import type { UpdatePreferencesDto } from './dto/update-preferences.dto';
import type { EmailJobData } from '../email/email-queue.types';

const DEFAULT_TAKE = 20;

@Injectable()
export class NotificationsService implements OnModuleDestroy {
  private readonly streams = new Map<string, Subject<MessageEvent>>();

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  onModuleDestroy() {
    for (const subject of this.streams.values()) {
      subject.complete();
    }
    this.streams.clear();
  }

  // ---------- SSE streaming ----------

  subscribe(userId: string): Observable<MessageEvent> {
    let subject = this.streams.get(userId);
    if (!subject || subject.closed) {
      subject = new Subject<MessageEvent>();
      this.streams.set(userId, subject);
    }
    return subject.asObservable();
  }

  unsubscribe(userId: string): void {
    const subject = this.streams.get(userId);
    if (subject) {
      subject.complete();
      this.streams.delete(userId);
    }
  }

  // Push SSE only — for cases where the DB record is already created (e.g. createMany in a transaction).
  pushLive(userId: string, data: Omit<CreateNotificationDto, 'link'> & { link?: string }): void {
    const subject = this.streams.get(userId);
    if (subject && !subject.closed) {
      subject.next({
        data: JSON.stringify({
          type: data.type,
          title: data.title,
          body: data.body,
          link: data.link,
          createdAt: new Date().toISOString(),
        }),
      });
    }
  }

  // ---------- Core create ----------

  async createAndNotify(userId: string, data: CreateNotificationDto): Promise<void> {
    const notification = await this.prisma.notification.create({
      data: { userId, ...data },
    });

    // Push to SSE stream if the user has an active connection
    const subject = this.streams.get(userId);
    if (subject && !subject.closed) {
      subject.next({
        data: JSON.stringify({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          link: notification.link,
          createdAt: notification.createdAt.toISOString(),
        }),
      });
    }

    // Enqueue email based on notification type and user preferences
    await this.maybeQueueEmail(userId, data);
  }

  private async maybeQueueEmail(
    userId: string,
    data: CreateNotificationDto,
  ): Promise<void> {
    const prefs = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    const emailType = this.resolveEmailJobType(data.type, prefs);
    if (!emailType) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (!user) return;

    await this.emailQueue.add(
      'notification',
      {
        kind: emailType,
        to: user.email,
        name: user.name,
        title: data.title,
        body: data.body,
        link: data.link,
      } satisfies EmailJobData,
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
  }

  private resolveEmailJobType(
    type: NotificationType,
    prefs: { emailQaReplies: boolean; emailReviewReplies: boolean } | null,
  ): string | null {
    switch (type) {
      case NotificationType.QA_ANSWER:
        return prefs?.emailQaReplies !== false ? 'qa-answer' : null;
      case NotificationType.NEW_REVIEW:
        return prefs?.emailReviewReplies !== false ? 'review-reply' : null;
      case NotificationType.COURSE_UPDATE:
        return 'course-update';
      case NotificationType.ORDER_PAID:
        return null; // handled separately by orders module
      case NotificationType.NEW_MESSAGE:
        return 'new-message';
      default:
        return null;
    }
  }

  // ---------- CRUD ----------

  async list(userId: string, query: ListNotificationsDto) {
    const take = query.take ?? DEFAULT_TAKE;
    const cursor = query.cursor;

    const [items, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          link: true,
          readAt: true,
          createdAt: true,
        },
      }),
      this.prisma.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

    let nextCursor: string | null = null;
    if (items.length > take) {
      const next = items.pop();
      nextCursor = next?.id ?? null;
    }

    return {
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        readAt: n.readAt ? n.readAt.toISOString() : null,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
      nextCursor,
    };
  }

  async markRead(userId: string, id: string) {
    const updated = await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
    if (updated.count === 0) {
      const exists = await this.prisma.notification.findFirst({
        where: { id, userId },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException('notification_not_found');
    }
    return { ok: true };
  }

  async markAllRead(userId: string) {
    const updated = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true, updated: updated.count };
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.notification.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('notification_not_found');
    await this.prisma.notification.delete({ where: { id } });
    return { ok: true };
  }

  // ---------- Preferences ----------

  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }
}
