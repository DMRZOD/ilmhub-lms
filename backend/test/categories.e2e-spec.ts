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

d('Categories (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let hasSeed = false;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    const publishedCount = await prisma.course.count({
      where: { status: 'PUBLISHED' },
    });
    hasSeed = publishedCount >= 8;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /categories returns all categories sorted by sortOrder', async () => {
    if (!hasSeed) return;
    const res = await request(app.getHttpServer()).get('/categories').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(8);
    const sortOrders = res.body.map((c: any) => c.sortOrder);
    const sorted = [...sortOrders].sort((a, b) => a - b);
    expect(sortOrders).toEqual(sorted);
    for (const c of res.body) {
      expect(c).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          slug: expect.any(String),
          name: expect.any(String),
          coursesCount: expect.any(Number),
        }),
      );
    }
  });

  it('GET /categories/:slug returns category + paginated courses', async () => {
    if (!hasSeed) return;
    const someCategory = await prisma.category.findFirst({
      where: { courses: { some: { status: 'PUBLISHED' } } },
    });
    expect(someCategory).not.toBeNull();

    const res = await request(app.getHttpServer())
      .get(`/categories/${someCategory!.slug}?page=1&limit=5`)
      .expect(200);

    expect(res.body.category).toEqual(
      expect.objectContaining({ slug: someCategory!.slug }),
    );
    expect(res.body.courses).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        meta: expect.objectContaining({
          total: expect.any(Number),
          page: 1,
          limit: 5,
          totalPages: expect.any(Number),
        }),
      }),
    );
    expect(res.body.courses.items.length).toBeLessThanOrEqual(5);
    for (const c of res.body.courses.items) {
      expect(c.category.slug).toBe(someCategory!.slug);
    }
  });

  it('GET /categories/non-existent returns 404', async () => {
    if (!hasSeed) return;
    await request(app.getHttpServer())
      .get('/categories/this-does-not-exist-xyz')
      .expect(404);
  });
});
