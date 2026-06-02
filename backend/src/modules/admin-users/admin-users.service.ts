import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import { paginate } from '../../common/dto/pagination.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailUsersDto } from './dto/email-users.dto';

const USER_LIST_SELECT = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly audit: AuditService,
  ) {}

  // ---------- List ----------

  async list(query: ListUsersDto) {
    const { page, limit, q, role, status, sort } = query;

    const where: Prisma.UserWhereInput = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    };

    const orderBy: Prisma.UserOrderByWithRelationInput =
      sort === 'oldest'
        ? { createdAt: 'asc' }
        : sort === 'name'
          ? { name: 'asc' }
          : sort === 'lastLogin'
            ? { lastLoginAt: { sort: 'desc', nulls: 'last' } }
            : { createdAt: 'desc' };

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: USER_LIST_SELECT,
      }),
    ]);

    if (users.length === 0) {
      return paginate([], total, page, limit);
    }

    const userIds = users.map((u) => u.id);
    const enrollGroups = await this.prisma.enrollment.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _count: { _all: true },
    });
    const coursesByUser = new Map<string, number>();
    for (const g of enrollGroups) {
      coursesByUser.set(g.userId, g._count._all);
    }

    const items = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
      role: u.role,
      status: u.status,
      coursesCount: coursesByUser.get(u.id) ?? 0,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
    }));

    return paginate(items, total, page, limit);
  }

  // ---------- Detail ----------

  async detail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('user_not_found');

    const [enrollments, orders, auditLog] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { userId: id },
        orderBy: { enrolledAt: 'desc' },
        select: {
          enrolledAt: true,
          completedAt: true,
          course: {
            select: { id: true, title: true, slug: true, thumbnailUrl: true },
          },
        },
      }),
      this.prisma.order.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          totalUsdCents: true,
          status: true,
          paidAt: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              priceUsdCents: true,
              course: { select: { id: true, title: true, slug: true } },
            },
          },
        },
      }),
      this.audit.listForTarget('USER', id),
    ]);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
        createdAt: user.createdAt.toISOString(),
      },
      courses: enrollments.map((e) => ({
        course: e.course,
        enrolledAt: e.enrolledAt.toISOString(),
        completedAt: e.completedAt ? e.completedAt.toISOString() : null,
      })),
      orders: orders.map((o) => ({
        id: o.id,
        totalUsdCents: o.totalUsdCents,
        status: o.status,
        paidAt: o.paidAt ? o.paidAt.toISOString() : null,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((it) => ({
          id: it.id,
          priceUsdCents: it.priceUsdCents,
          course: it.course,
        })),
      })),
      auditLog,
    };
  }

  // ---------- Update (role / status) ----------

  async update(id: string, adminId: string, dto: UpdateUserDto) {
    if (id === adminId) {
      throw new ForbiddenException('cannot_modify_self');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, status: true },
    });
    if (!user) throw new NotFoundException('user_not_found');

    const data: Prisma.UserUpdateInput = {};
    const auditOps: Array<() => Promise<void>> = [];

    if (dto.role && dto.role !== user.role) {
      // Demoting an ADMIN must never leave the platform without one.
      if (user.role === 'ADMIN') {
        const adminCount = await this.prisma.user.count({
          where: { role: 'ADMIN' },
        });
        if (adminCount <= 1) {
          throw new ConflictException('cannot_demote_last_admin');
        }
      }
      data.role = dto.role;
      const from = user.role;
      const to = dto.role;
      auditOps.push(() =>
        this.audit.log(adminId, 'USER_ROLE_CHANGED', 'USER', id, { from, to }),
      );
    }

    if (dto.status && dto.status !== user.status) {
      data.status = dto.status;
      if (dto.status === 'SUSPENDED') {
        auditOps.push(() =>
          this.audit.log(adminId, 'USER_SUSPENDED', 'USER', id, {
            from: user.status,
          }),
        );
      } else {
        auditOps.push(() =>
          this.audit.log(adminId, 'USER_UNSUSPENDED', 'USER', id, {
            from: user.status,
          }),
        );
      }
    }

    if (Object.keys(data).length === 0) {
      return this.detail(id);
    }

    await this.prisma.user.update({ where: { id }, data });

    // Suspending a user cuts off existing sessions by revoking refresh tokens.
    if (data.status === 'SUSPENDED') {
      await this.prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    for (const op of auditOps) await op();

    return this.detail(id);
  }

  // ---------- Hard delete ----------

  async remove(id: string, adminId: string) {
    if (id === adminId) {
      throw new ForbiddenException('cannot_delete_self');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) throw new NotFoundException('user_not_found');

    // Courses use onDelete: Restrict, so an instructor with courses can't be deleted.
    const ownedCourses = await this.prisma.course.count({
      where: { instructorId: id },
    });
    if (ownedCourses > 0) {
      throw new ConflictException('user_owns_courses');
    }

    if (user.role === 'ADMIN') {
      const adminCount = await this.prisma.user.count({
        where: { role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        throw new ConflictException('cannot_delete_last_admin');
      }
    }

    // Record the deletion before the row (and its relations) disappear.
    await this.audit.log(adminId, 'USER_DELETED', 'USER', id, {
      name: user.name,
      email: user.email,
      role: user.role,
    });

    await this.prisma.user.delete({ where: { id } });

    return { id, deleted: true };
  }

  // ---------- Bulk email ----------

  async emailUsers(adminId: string, dto: EmailUsersDto) {
    const users = await this.prisma.user.findMany({
      where: { id: { in: dto.userIds } },
      select: { id: true, email: true, name: true },
    });
    if (users.length === 0) {
      throw new NotFoundException('no_recipients');
    }

    await Promise.all(
      users.map((u) =>
        this.email.sendAdminMessageEmail(u.email, u.name, {
          subject: dto.subject,
          body: dto.body,
        }),
      ),
    );

    await this.audit.log(adminId, 'USER_EMAILED', 'USER', null, {
      userIds: users.map((u) => u.id),
      count: users.length,
      subject: dto.subject,
    });

    return { sent: users.length };
  }
}
