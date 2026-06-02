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

const DOMAIN = 'quiz-tester.ilmhub.uz';
const PASSWORD = 'Qu1zTest!pass';

d('Quizzes (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let hasQuizInFreeCourse = false;
  let freeCourseId: string;
  let quizLessonId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    // A QUIZ lesson inside a free, published course so the tester can enroll.
    const lesson = await prisma.lesson.findFirst({
      where: {
        type: 'QUIZ',
        section: { course: { status: 'PUBLISHED', priceUsdCents: 0 } },
      },
      select: { id: true, section: { select: { courseId: true } } },
    });
    hasQuizInFreeCourse = Boolean(lesson);
    if (!hasQuizInFreeCourse) return;
    quizLessonId = lesson!.id;
    freeCourseId = lesson!.section.courseId;
  });

  afterAll(async () => {
    if (hasTestDb) {
      const where = { user: { email: { contains: DOMAIN } } };
      await prisma.quizAttempt.deleteMany({ where });
      await prisma.enrollment.deleteMany({ where });
      await prisma.user.deleteMany({ where: { email: { contains: DOMAIN } } });
    }
    await app.close();
  });

  it('requires auth to fetch a lesson quiz', async () => {
    if (!hasTestDb) return;
    await request(app.getHttpServer())
      .get(`/lessons/any-lesson/quiz`)
      .expect(401);
  });

  it('requires auth to submit an attempt', async () => {
    if (!hasTestDb) return;
    await request(app.getHttpServer())
      .post(`/quizzes/any-quiz/attempts`)
      .send({ answers: [{ questionId: 'x', selectedOptionIds: ['y'] }] })
      .expect(401);
  });

  it('lets an enrolled student fetch the quiz and submit an attempt', async () => {
    if (!hasQuizInFreeCourse) return;
    const email = `student-${Date.now()}@${DOMAIN}`;
    await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(PASSWORD, 4),
        name: 'Quiz Student',
        role: 'STUDENT',
        emailVerified: true,
      },
    });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: PASSWORD })
      .expect(200);
    const token = login.body.accessToken as string;

    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId: freeCourseId })
      .expect(201);

    const quizRes = await request(app.getHttpServer())
      .get(`/lessons/${quizLessonId}/quiz`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(quizRes.body).toEqual(
      expect.objectContaining({ id: expect.any(String) }),
    );
    const quizId = quizRes.body.id as string;
    const questions: any[] = quizRes.body.questions ?? [];
    expect(questions.length).toBeGreaterThan(0);

    // Build a best-effort answer for each question (first option / placeholder
    // text). We assert the attempt is scored, not that it passes.
    const answers = questions.map((q) => ({
      questionId: q.id,
      selectedOptionIds: q.options?.[0]?.id ? [q.options[0].id] : [],
      textAnswer: 'test',
    }));

    const attempt = await request(app.getHttpServer())
      .post(`/quizzes/${quizId}/attempts`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers })
      .expect(201);
    expect(attempt.body).toEqual(
      expect.objectContaining({ passed: expect.any(Boolean) }),
    );
  });
});
