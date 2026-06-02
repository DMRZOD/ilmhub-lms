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

const DOMAIN = 'progress-tester.ilmhub.uz';
const PASSWORD = 'Pr0gressTest!';

d('Lesson progress (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let hasSeed = false;
  let freeCourseId: string;
  let lessonId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    const lesson = await prisma.lesson.findFirst({
      where: { section: { course: { status: 'PUBLISHED', priceUsdCents: 0 } } },
      select: { id: true, section: { select: { courseId: true } } },
    });
    hasSeed = Boolean(lesson);
    if (!hasSeed) return;
    lessonId = lesson!.id;
    freeCourseId = lesson!.section.courseId;
  });

  afterAll(async () => {
    if (hasSeed) {
      const where = { user: { email: { contains: DOMAIN } } };
      await prisma.lessonProgress.deleteMany({ where });
      await prisma.enrollment.deleteMany({ where });
      await prisma.user.deleteMany({ where: { email: { contains: DOMAIN } } });
    }
    await app.close();
  });

  async function createEnrolledStudent(label: string) {
    const email = `${label}-${Date.now()}@${DOMAIN}`;
    await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(PASSWORD, 4),
        name: `Tester ${label}`,
        role: 'STUDENT',
        emailVerified: true,
      },
    });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: PASSWORD })
      .expect(200);
    return login.body.accessToken as string;
  }

  it('rejects unauthenticated progress writes', async () => {
    if (!hasSeed) return;
    await request(app.getHttpServer())
      .post(`/lessons/${lessonId}/progress`)
      .send({ positionSeconds: 10 })
      .expect(401);
  });

  it('rejects progress on a lesson the user is not enrolled in (403)', async () => {
    if (!hasSeed) return;
    const token = await createEnrolledStudent('notenrolled');
    await request(app.getHttpServer())
      .post(`/lessons/${lessonId}/progress`)
      .set('Authorization', `Bearer ${token}`)
      .send({ positionSeconds: 10 })
      .expect(403);
  });

  it('returns 404 for an unknown lesson', async () => {
    if (!hasSeed) return;
    const token = await createEnrolledStudent('unknown');
    await request(app.getHttpServer())
      .post(`/lessons/does-not-exist-xyz/progress`)
      .set('Authorization', `Bearer ${token}`)
      .send({ positionSeconds: 10 })
      .expect(404);
  });

  it('records position for an enrolled student', async () => {
    if (!hasSeed) return;
    const token = await createEnrolledStudent('happy');
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId: freeCourseId })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(`/lessons/${lessonId}/progress`)
      .set('Authorization', `Bearer ${token}`)
      .send({ positionSeconds: 73 })
      .expect(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('validates the payload (negative position -> 400)', async () => {
    if (!hasSeed) return;
    const token = await createEnrolledStudent('bad');
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId: freeCourseId })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/lessons/${lessonId}/progress`)
      .set('Authorization', `Bearer ${token}`)
      .send({ positionSeconds: -5 })
      .expect(400);
  });
});
