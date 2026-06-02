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

d('Instructors (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let hasSeed = false;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    const instrCount = await prisma.user.count({
      where: { role: 'INSTRUCTOR' },
    });
    hasSeed = instrCount >= 3;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /instructors returns paginated instructors with stats', async () => {
    if (!hasSeed) return;
    const res = await request(app.getHttpServer())
      .get('/instructors?limit=10')
      .expect(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.meta).toEqual(
      expect.objectContaining({
        total: expect.any(Number),
        page: 1,
        limit: 10,
        totalPages: expect.any(Number),
      }),
    );
    for (const i of res.body.items) {
      expect(i).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          stats: expect.objectContaining({
            coursesCount: expect.any(Number),
            studentsCount: expect.any(Number),
            ratingAvg: expect.any(Number),
            reviewsCount: expect.any(Number),
          }),
        }),
      );
    }
  });

  it('GET /instructors?sort=popular orders by studentsCount desc', async () => {
    if (!hasSeed) return;
    const res = await request(app.getHttpServer())
      .get('/instructors?sort=popular&limit=20')
      .expect(200);
    const counts = res.body.items.map((i: any) => i.stats.studentsCount);
    const sorted = [...counts].sort((a, b) => b - a);
    expect(counts).toEqual(sorted);
  });

  it('GET /instructors/:id returns profile + published courses', async () => {
    if (!hasSeed) return;
    const ins = await prisma.user.findFirst({
      where: {
        role: 'INSTRUCTOR',
        instructorCourses: { some: { status: 'PUBLISHED' } },
      },
    });
    const res = await request(app.getHttpServer())
      .get(`/instructors/${ins!.id}`)
      .expect(200);
    expect(res.body.id).toBe(ins!.id);
    expect(res.body.stats).toBeDefined();
    expect(Array.isArray(res.body.courses)).toBe(true);
    expect(res.body.courses.length).toBeGreaterThan(0);
    for (const c of res.body.courses) {
      expect(c.instructor.id).toBe(ins!.id);
    }
  });

  it('GET /instructors/:id returns 404 for non-instructor user', async () => {
    if (!hasSeed) return;
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    });
    await request(app.getHttpServer())
      .get(`/instructors/${student!.id}`)
      .expect(404);
  });
});
