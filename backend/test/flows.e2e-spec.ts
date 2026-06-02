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
import request from 'supertest';

import { PrismaService } from '../src/modules/prisma/prisma.service';
import { createTestApp } from './helpers/app';

const hasTestDb = !!process.env.TEST_DATABASE_URL;
const d = hasTestDb ? describe : describe.skip;

const DOMAIN = 'flow-tester.ilmhub.uz';
const PASSWORD = 'Fl0wTest!pass';

/**
 * The roadmap's named critical backend E2E:
 *   register -> login -> enroll (free) -> record progress.
 * Runs against a real seeded test database.
 */
d('Critical flow: register -> login -> enroll -> progress (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let hasSeed = false;
  let freeCourseId: string;
  let firstLessonId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    // Need a free, published course that actually has a lesson to progress on.
    const lesson = await prisma.lesson.findFirst({
      where: {
        section: { course: { status: 'PUBLISHED', priceUsdCents: 0 } },
      },
      select: { id: true, section: { select: { courseId: true } } },
    });
    hasSeed = Boolean(lesson);
    if (!hasSeed) return;
    firstLessonId = lesson!.id;
    freeCourseId = lesson!.section.courseId;
  });

  afterAll(async () => {
    if (hasSeed) {
      const where = { user: { email: { contains: DOMAIN } } };
      await prisma.lessonProgress.deleteMany({ where });
      await prisma.enrollment.deleteMany({ where });
      await prisma.refreshToken.deleteMany({ where });
      await prisma.emailVerificationToken.deleteMany({ where });
      await prisma.user.deleteMany({
        where: { email: { contains: DOMAIN } },
      });
    }
    await app.close();
  });

  it('walks a brand-new student from sign-up through recorded lesson progress', async () => {
    if (!hasSeed) return;
    const server = app.getHttpServer();
    const email = `student-${Date.now()}@${DOMAIN}`;

    // 1. Register
    const reg = await request(server)
      .post('/auth/register')
      .send({ email, password: PASSWORD, name: 'Flow Student', role: 'STUDENT' })
      .expect(201);
    expect(reg.body.accessToken).toEqual(expect.any(String));

    // 2. Login (independent of the register tokens)
    const login = await request(server)
      .post('/auth/login')
      .send({ email, password: PASSWORD })
      .expect(200);
    const token = login.body.accessToken as string;
    expect(token).toEqual(expect.any(String));

    // 3. Enroll in the free course
    const enroll = await request(server)
      .post('/enrollments')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId: freeCourseId })
      .expect(201);
    expect(enroll.body).toEqual(
      expect.objectContaining({ courseId: freeCourseId, alreadyEnrolled: false }),
    );

    // 4. Record playback progress, then mark the lesson completed
    await request(server)
      .post(`/lessons/${firstLessonId}/progress`)
      .set('Authorization', `Bearer ${token}`)
      .send({ positionSeconds: 42 })
      .expect(200);

    await request(server)
      .post(`/lessons/${firstLessonId}/progress`)
      .set('Authorization', `Bearer ${token}`)
      .send({ positionSeconds: 120, completed: true })
      .expect(200);

    // 5. Verify the progress was persisted
    const user = await prisma.user.findUnique({ where: { email } });
    const progress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: user!.id, lessonId: firstLessonId } },
    });
    expect(progress).not.toBeNull();
    expect(progress!.lastPositionSeconds).toBe(120);
    expect(progress!.completedAt).not.toBeNull();

    // ...and that the enrollment shows up in the student's list
    const list = await request(server)
      .get('/me/enrollments')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const ids = list.body.items.map((i: any) => i.course.id);
    expect(ids).toContain(freeCourseId);
  });
});
