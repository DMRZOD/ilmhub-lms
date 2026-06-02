/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.DIRECT_URL = process.env.TEST_DATABASE_URL;
}
process.env.JWT_SECRET ??= 'test-jwt-secret-at-least-sixteen-chars';
process.env.JWT_REFRESH_SECRET ??=
  'test-jwt-refresh-secret-at-least-sixteen-chars';
process.env.FRONTEND_URL ??= 'http://localhost:3000';
process.env.NODE_ENV = 'test';

import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import request from 'supertest';

import { PrismaService } from '../src/modules/prisma/prisma.service';
import { createTestApp } from './helpers/app';

const hasTestDb = !!process.env.TEST_DATABASE_URL;
const d = hasTestDb ? describe : describe.skip;

const TEST_EMAIL_DOMAIN = 'enroll-tester.ilmhub.uz';
const TEST_PASSWORD = 'TestPa$$w0rd!';

async function loginAndGetToken(
  app: INestApplication,
  email: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password: TEST_PASSWORD })
    .expect(200);
  return res.body.accessToken as string;
}

d('Enrollments (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let hasSeed = false;
  let freeCourseId: string;
  let paidCourseId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    const free = await prisma.course.findFirst({
      where: { status: 'PUBLISHED', priceUsdCents: 0 },
    });
    const paid = await prisma.course.findFirst({
      where: { status: 'PUBLISHED', priceUsdCents: { gt: 0 } },
    });
    hasSeed = Boolean(free && paid);
    if (!hasSeed) return;
    freeCourseId = free!.id;
    paidCourseId = paid!.id;
  });

  afterAll(async () => {
    if (hasSeed) {
      await prisma.enrollment.deleteMany({
        where: { user: { email: { contains: TEST_EMAIL_DOMAIN } } },
      });
      await prisma.user.deleteMany({
        where: { email: { contains: TEST_EMAIL_DOMAIN } },
      });
    }
    await app.close();
  });

  async function createTestUser(label: string) {
    const email = `${label}-${Date.now()}@${TEST_EMAIL_DOMAIN}`;
    await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(TEST_PASSWORD, 10),
        name: `Tester ${label}`,
        role: 'STUDENT',
        emailVerified: true,
      },
    });
    const token = await loginAndGetToken(app, email);
    return { email, token };
  }

  describe('POST /enrollments', () => {
    it('rejects unauthenticated', async () => {
      if (!hasSeed) return;
      await request(app.getHttpServer())
        .post('/enrollments')
        .send({ courseId: freeCourseId })
        .expect(401);
    });

    it('enrolls in a free course', async () => {
      if (!hasSeed) return;
      const { token } = await createTestUser('free');
      const res = await request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${token}`)
        .send({ courseId: freeCourseId })
        .expect(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          courseId: freeCourseId,
          alreadyEnrolled: false,
        }),
      );
    });

    it('returns alreadyEnrolled=true on duplicate', async () => {
      if (!hasSeed) return;
      const { token } = await createTestUser('dup');
      await request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${token}`)
        .send({ courseId: freeCourseId })
        .expect(201);
      const res = await request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${token}`)
        .send({ courseId: freeCourseId })
        .expect(201);
      expect(res.body.alreadyEnrolled).toBe(true);
    });

    it('rejects paid course with 403 (payment required)', async () => {
      if (!hasSeed) return;
      const { token } = await createTestUser('paid');
      await request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${token}`)
        .send({ courseId: paidCourseId })
        .expect(403);
    });

    it('returns 404 for unknown course', async () => {
      if (!hasSeed) return;
      const { token } = await createTestUser('unknown');
      await request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${token}`)
        .send({ courseId: 'does-not-exist-xyz' })
        .expect(404);
    });
  });

  describe('GET /me/enrollments', () => {
    it('rejects unauthenticated', async () => {
      if (!hasSeed) return;
      await request(app.getHttpServer())
        .get('/me/enrollments')
        .expect(401);
    });

    it('returns paginated enrollments with progress', async () => {
      if (!hasSeed) return;
      const { token } = await createTestUser('list');
      await request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${token}`)
        .send({ courseId: freeCourseId })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/me/enrollments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0]).toEqual(
        expect.objectContaining({
          progressPercent: expect.any(Number),
          course: expect.objectContaining({ id: freeCourseId }),
        }),
      );
      expect(res.body.meta.total).toBe(1);
    });

    it('filters by status=notStarted', async () => {
      if (!hasSeed) return;
      const { token } = await createTestUser('status');
      await request(app.getHttpServer())
        .post('/enrollments')
        .set('Authorization', `Bearer ${token}`)
        .send({ courseId: freeCourseId })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/me/enrollments?status=notStarted')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.items.length).toBe(1);

      const completed = await request(app.getHttpServer())
        .get('/me/enrollments?status=completed')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(completed.body.items).toHaveLength(0);
    });

    it('rejects unknown sort value', async () => {
      if (!hasSeed) return;
      const { token } = await createTestUser('bad-sort');
      await request(app.getHttpServer())
        .get('/me/enrollments?sort=bogus')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });
});
