import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { PinoLogger } from 'nestjs-pino';

import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import {
  COURSE_CARD_INCLUDE,
  toCourseCard,
} from '../courses/course-card.mapper';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

const BCRYPT_ROUNDS = 12;
const EMAIL_CHANGE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const DAY_MS = 24 * 60 * 60 * 1000;
const DASHBOARD_WEEK_DAYS = 7;
const STREAK_LOOKBACK_DAYS = 60;
const MINUTES_PER_LESSON_TOUCH = 5;

function startOfUtcDay(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  role: true,
  status: true,
  name: true,
  bio: true,
  avatarUrl: true,
  emailVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<AuthenticatedUser> {
    const data: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.bio !== undefined) data.bio = dto.bio;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    if (Object.keys(data).length === 0) {
      const current = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: PUBLIC_USER_SELECT,
      });
      return current;
    }
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: PUBLIC_USER_SELECT,
    });
  }

  async updateAvatar(
    userId: string,
    dto: UpdateAvatarDto,
  ): Promise<AuthenticatedUser> {
    const commaIdx = dto.avatarDataUrl.indexOf(',');
    const base64 = commaIdx >= 0 ? dto.avatarDataUrl.slice(commaIdx + 1) : '';
    const decodedBytes = Math.floor((base64.length * 3) / 4);
    if (decodedBytes > MAX_AVATAR_BYTES) {
      throw new BadRequestException('Avatar exceeds 2 MB');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: dto.avatarDataUrl },
      select: PUBLIC_USER_SELECT,
    });
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const record = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!record) throw new UnauthorizedException();
    if (!record.passwordHash) {
      throw new BadRequestException(
        'This account uses Google sign-in; set a password via the reset flow first',
      );
    }
    const ok = await bcrypt.compare(dto.oldPassword, record.passwordHash);
    if (!ok) throw new BadRequestException('Old password is incorrect');

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async requestEmailChange(
    userId: string,
    dto: RequestEmailChangeDto,
  ): Promise<void> {
    const normalized = dto.newEmail.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    if (!user) throw new UnauthorizedException();
    if (user.email === normalized) {
      throw new BadRequestException('New email is the same as the current one');
    }
    const taken = await this.prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true },
    });
    if (taken) throw new ConflictException('Email is already registered');

    const token = randomBytes(32).toString('hex');
    await this.prisma.emailChangeToken.create({
      data: {
        userId,
        newEmail: normalized,
        token,
        expiresAt: new Date(Date.now() + EMAIL_CHANGE_TTL_MS),
      },
    });
    await this.email.sendEmailChangeEmail(normalized, user.name, normalized, token);
  }

  async confirmEmailChange(token: string): Promise<void> {
    if (!token) throw new BadRequestException('Token is required');
    const record = await this.prisma.emailChangeToken.findUnique({
      where: { token },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    const taken = await this.prisma.user.findUnique({
      where: { email: record.newEmail },
      select: { id: true },
    });
    if (taken && taken.id !== record.userId) {
      throw new ConflictException('Email is already registered');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { email: record.newEmail, emailVerified: true },
      }),
      this.prisma.emailChangeToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async deleteAccount(userId: string, dto: DeleteAccountDto): Promise<void> {
    const record = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!record) throw new UnauthorizedException();
    if (!record.passwordHash) {
      throw new BadRequestException(
        'This account uses Google sign-in; deletion requires a password to be set first',
      );
    }
    const ok = await bcrypt.compare(dto.password, record.passwordHash);
    if (!ok) throw new UnauthorizedException('Password is incorrect');

    await this.prisma.user.delete({ where: { id: userId } });
    this.logger.info({ userId }, 'user account deleted');
  }

  async getDashboard(userId: string) {
    const now = new Date();
    const todayStart = startOfUtcDay(now);
    const weekStart = new Date(
      todayStart.getTime() - (DASHBOARD_WEEK_DAYS - 1) * DAY_MS,
    );
    const streakStart = new Date(
      todayStart.getTime() - STREAK_LOOKBACK_DAYS * DAY_MS,
    );

    const [
      user,
      currentLessonRow,
      enrollmentsRaw,
      lessonProgressForWeek,
      recentAchievementsRaw,
      streakRows,
    ] = await this.prisma.$transaction([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
      }),
      this.prisma.lessonProgress.findFirst({
        where: { userId, completedAt: null },
        orderBy: { updatedAt: 'desc' },
        include: {
          lesson: {
            include: {
              section: {
                include: {
                  course: {
                    select: {
                      id: true,
                      slug: true,
                      title: true,
                      thumbnailUrl: true,
                      lessonsCount: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.enrollment.findMany({
        where: { userId, completedAt: null },
        orderBy: { enrolledAt: 'desc' },
        take: 6,
        include: {
          course: {
            select: {
              id: true,
              slug: true,
              title: true,
              subtitle: true,
              thumbnailUrl: true,
              lessonsCount: true,
              durationMinutes: true,
              categoryId: true,
              instructor: {
                select: { id: true, name: true, avatarUrl: true },
              },
              category: {
                select: { id: true, slug: true, name: true, iconName: true },
              },
            },
          },
        },
      }),
      this.prisma.lessonProgress.findMany({
        where: { userId, updatedAt: { gte: weekStart } },
        select: { updatedAt: true, lessonId: true },
      }),
      this.prisma.userAchievement.findMany({
        where: { userId },
        orderBy: { earnedAt: 'desc' },
        take: 3,
        include: { achievement: true },
      }),
      this.prisma.lessonProgress.findMany({
        where: { userId, updatedAt: { gte: streakStart } },
        select: { updatedAt: true },
      }),
    ]);

    if (!user) throw new UnauthorizedException();

    const enrolledCourseIds = enrollmentsRaw.map((e) => e.courseId);
    const enrolledCategoryIds = Array.from(
      new Set(enrollmentsRaw.map((e) => e.course.categoryId)),
    );

    const completedRows = enrolledCourseIds.length
      ? await this.prisma.lessonProgress.findMany({
          where: {
            userId,
            completedAt: { not: null },
            lesson: { section: { courseId: { in: enrolledCourseIds } } },
          },
          select: { lesson: { select: { section: { select: { courseId: true } } } } },
        })
      : [];
    const completedByCourse = new Map<string, number>();
    for (const row of completedRows) {
      const cid = row.lesson.section.courseId;
      completedByCourse.set(cid, (completedByCourse.get(cid) ?? 0) + 1);
    }

    const inProgressCourses = enrollmentsRaw
      .map((e) => {
        const total = e.course.lessonsCount;
        const completed = completedByCourse.get(e.course.id) ?? 0;
        const progress =
          total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          id: e.course.id,
          slug: e.course.slug,
          title: e.course.title,
          subtitle: e.course.subtitle,
          thumbnailUrl: e.course.thumbnailUrl,
          lessonsCount: total,
          durationMinutes: e.course.durationMinutes,
          completedLessons: completed,
          progress,
          instructor: e.course.instructor,
          category: e.course.category,
          enrolledAt: e.enrolledAt.toISOString(),
        };
      })
      .filter((c) => c.progress < 100);

    let currentLesson: {
      lessonId: string;
      lessonTitle: string;
      courseId: string;
      courseSlug: string;
      courseTitle: string;
      thumbnailUrl: string | null;
      lastPositionSeconds: number;
      progress: number;
      completedLessons: number;
      lessonsCount: number;
    } | null = null;
    if (currentLessonRow) {
      const course = currentLessonRow.lesson.section.course;
      const completed = completedByCourse.get(course.id) ?? 0;
      const total = course.lessonsCount;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      currentLesson = {
        lessonId: currentLessonRow.lessonId,
        lessonTitle: currentLessonRow.lesson.title,
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        thumbnailUrl: course.thumbnailUrl,
        lastPositionSeconds: currentLessonRow.lastPositionSeconds,
        progress,
        completedLessons: completed,
        lessonsCount: total,
      };
    }

    const dayBuckets = new Map<string, Set<string>>();
    for (let i = 0; i < DASHBOARD_WEEK_DAYS; i++) {
      const d = new Date(weekStart.getTime() + i * DAY_MS);
      dayBuckets.set(isoDay(d), new Set());
    }
    for (const row of lessonProgressForWeek) {
      const key = isoDay(row.updatedAt);
      const bucket = dayBuckets.get(key);
      if (bucket) bucket.add(row.lessonId);
    }
    const weeklyHours = Array.from(dayBuckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, set]) => {
        const minutes = set.size * MINUTES_PER_LESSON_TOUCH;
        return { date, hours: Math.round((minutes / 60) * 10) / 10 };
      });

    const todayKey = isoDay(todayStart);
    const todayMinutes =
      (dayBuckets.get(todayKey)?.size ?? 0) * MINUTES_PER_LESSON_TOUCH;

    const activityDays = new Set(streakRows.map((r) => isoDay(r.updatedAt)));
    let streakDays = 0;
    let probe = todayStart;
    while (activityDays.has(isoDay(probe))) {
      streakDays += 1;
      probe = new Date(probe.getTime() - DAY_MS);
    }

    const recommendedWhere: Prisma.CourseWhereInput = {
      status: 'PUBLISHED',
      ...(enrolledCategoryIds.length
        ? { categoryId: { in: enrolledCategoryIds } }
        : {}),
      ...(enrolledCourseIds.length
        ? { id: { notIn: enrolledCourseIds } }
        : {}),
    };
    const recommendedRows = await this.prisma.course.findMany({
      where: recommendedWhere,
      include: COURSE_CARD_INCLUDE,
      orderBy: [{ ratingAvg: 'desc' }, { studentsCount: 'desc' }],
      take: 4,
    });
    const recommendedCourses = recommendedRows.map(toCourseCard);

    return {
      user,
      streakDays,
      todayMinutes,
      currentLesson,
      inProgressCourses,
      weeklyHours,
      recentAchievements: recentAchievementsRaw.map((ua) => ({
        id: ua.id,
        earnedAt: ua.earnedAt.toISOString(),
        achievement: {
          id: ua.achievement.id,
          code: ua.achievement.code,
          title: ua.achievement.title,
          description: ua.achievement.description,
          iconName: ua.achievement.iconName,
        },
      })),
      recommendedCourses,
    };
  }

}
