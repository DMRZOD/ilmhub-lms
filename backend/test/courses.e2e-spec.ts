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

const TEST_EMAIL_DOMAIN = 'review-tester.ilmhub.uz';
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

d('Courses (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let hasSeed = false;
  let publishedSlug: string;
  let publishedId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    const publishedCount = await prisma.course.count({
      where: { status: 'PUBLISHED' },
    });
    hasSeed = publishedCount >= 10;
    if (!hasSeed) return;

    const first = await prisma.course.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: { studentsCount: 'desc' },
    });
    publishedSlug = first!.slug;
    publishedId = first!.id;
  });

  afterAll(async () => {
    if (hasSeed) {
      await prisma.review.deleteMany({
        where: { user: { email: { contains: TEST_EMAIL_DOMAIN } } },
      });
      await prisma.enrollment.deleteMany({
        where: { user: { email: { contains: TEST_EMAIL_DOMAIN } } },
      });
      await prisma.user.deleteMany({
        where: { email: { contains: TEST_EMAIL_DOMAIN } },
      });
    }
    await app.close();
  });

  describe('GET /courses', () => {
    it('returns paginated published courses with meta', async () => {
      if (!hasSeed) return;
      const res = await request(app.getHttpServer())
        .get('/courses?limit=10')
        .expect(200);
      expect(res.body.items.length).toBeLessThanOrEqual(10);
      expect(res.body.meta).toEqual(
        expect.objectContaining({
          total: expect.any(Number),
          page: 1,
          limit: 10,
          totalPages: expect.any(Number),
        }),
      );
      expect(res.body.meta.total).toBeGreaterThan(0);
      for (const c of res.body.items) {
        expect(c.instructor).toEqual(
          expect.objectContaining({ id: expect.any(String) }),
        );
        expect(c.category).toEqual(
          expect.objectContaining({ slug: expect.any(String) }),
        );
      }
    });

    it('sort=price-asc returns ascending priceUsdCents', async () => {
      if (!hasSeed) return;
      const res = await request(app.getHttpServer())
        .get('/courses?sort=price-asc&limit=20')
        .expect(200);
      const prices = res.body.items.map((c: any) => c.priceUsdCents);
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sorted);
    });

    it('level filter restricts the result set', async () => {
      if (!hasSeed) return;
      const res = await request(app.getHttpServer())
        .get('/courses?level=BEGINNER&level=ADVANCED&limit=50')
        .expect(200);
      for (const c of res.body.items) {
        expect(['BEGINNER', 'ADVANCED']).toContain(c.level);
      }
    });

    it('categorySlug filter restricts to that category', async () => {
      if (!hasSeed) return;
      const cat = await prisma.category.findFirst({
        where: { courses: { some: { status: 'PUBLISHED' } } },
      });
      const res = await request(app.getHttpServer())
        .get(`/courses?categorySlug=${cat!.slug}&limit=50`)
        .expect(200);
      expect(res.body.items.length).toBeGreaterThan(0);
      for (const c of res.body.items) {
        expect(c.category.slug).toBe(cat!.slug);
      }
    });

    it('minRating filter respects threshold', async () => {
      if (!hasSeed) return;
      const res = await request(app.getHttpServer())
        .get('/courses?minRating=4&limit=50')
        .expect(200);
      for (const c of res.body.items) {
        expect(c.ratingAvg).toBeGreaterThanOrEqual(4);
      }
    });

    it('search hits at least one course when query matches a real title', async () => {
      if (!hasSeed) return;
      const sample = await prisma.course.findFirst({
        where: { status: 'PUBLISHED' },
        select: { title: true },
      });
      const needle = sample!.title.split(' ')[0]!.toLowerCase();
      const res = await request(app.getHttpServer())
        .get(`/courses?search=${encodeURIComponent(needle)}&limit=10`)
        .expect(200);
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('rejects unknown query parameter', async () => {
      if (!hasSeed) return;
      await request(app.getHttpServer())
        .get('/courses?unknownParam=1')
        .expect(400);
    });
  });

  describe('GET /courses/featured', () => {
    it('returns the requested number of courses', async () => {
      if (!hasSeed) return;
      const res = await request(app.getHttpServer())
        .get('/courses/featured?limit=4')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(4);
    });
  });

  describe('GET /courses/:slug', () => {
    it('returns full course with sections, lessons, and hidden videoAssetId for non-preview lessons', async () => {
      if (!hasSeed) return;
      const res = await request(app.getHttpServer())
        .get(`/courses/${publishedSlug}`)
        .expect(200);
      expect(res.body.slug).toBe(publishedSlug);
      expect(res.body.isEnrolled).toBe(false);
      expect(Array.isArray(res.body.sections)).toBe(true);
      expect(res.body.sections.length).toBeGreaterThan(0);
      expect(res.body.reviews).toEqual(
        expect.objectContaining({ items: expect.any(Array), meta: expect.any(Object) }),
      );
      for (const section of res.body.sections) {
        for (const lesson of section.lessons) {
          if (lesson.type === 'VIDEO' && !lesson.isPreview) {
            expect(lesson.videoAssetId).toBeNull();
          }
        }
      }
    });

    it('returns 404 for unknown slug', async () => {
      if (!hasSeed) return;
      await request(app.getHttpServer())
        .get('/courses/this-slug-does-not-exist-xyz')
        .expect(404);
    });

    it('shows isEnrolled=true and unmasks videoAssetId when caller is enrolled', async () => {
      if (!hasSeed) return;
      const email = `enrolled-${Date.now()}@${TEST_EMAIL_DOMAIN}`;
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(TEST_PASSWORD, 10),
          name: 'Enrolled Tester',
          role: 'STUDENT',
          emailVerified: true,
        },
      });
      await prisma.enrollment.create({
        data: { userId: user.id, courseId: publishedId },
      });

      const token = await loginAndGetToken(app, email);
      const res = await request(app.getHttpServer())
        .get(`/courses/${publishedSlug}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.isEnrolled).toBe(true);
      const videoLessons: any[] = res.body.sections.flatMap(
        (s: any) => s.lessons.filter((l: any) => l.type === 'VIDEO'),
      );
      if (videoLessons.length > 0) {
        const withAsset = videoLessons.filter((l) => l.videoAssetId !== null);
        expect(withAsset.length).toBe(videoLessons.length);
      }
    });

    it('does not return DRAFT courses', async () => {
      if (!hasSeed) return;
      const instructor = await prisma.user.findFirst({
        where: { role: 'INSTRUCTOR' },
      });
      const category = await prisma.category.findFirst();
      const draft = await prisma.course.create({
        data: {
          slug: `draft-test-${Date.now()}`,
          title: 'Draft only',
          description: 'hidden',
          instructorId: instructor!.id,
          categoryId: category!.id,
          status: 'DRAFT',
        },
      });
      try {
        await request(app.getHttpServer())
          .get(`/courses/${draft.slug}`)
          .expect(404);
        const list = await request(app.getHttpServer())
          .get(`/courses?search=${encodeURIComponent('Draft only')}`)
          .expect(200);
        const slugs = list.body.items.map((c: any) => c.slug);
        expect(slugs).not.toContain(draft.slug);
      } finally {
        await prisma.course.delete({ where: { id: draft.id } });
      }
    });
  });

  describe('GET /courses/:slug/reviews', () => {
    it('returns paginated reviews', async () => {
      if (!hasSeed) return;
      const res = await request(app.getHttpServer())
        .get(`/courses/${publishedSlug}/reviews?limit=5`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({ items: expect.any(Array), meta: expect.any(Object) }),
      );
    });
  });

  describe('POST /courses/:slug/reviews', () => {
    it('rejects unauthenticated requests', async () => {
      if (!hasSeed) return;
      await request(app.getHttpServer())
        .post(`/courses/${publishedSlug}/reviews`)
        .send({ rating: 5, comment: 'looks good '.repeat(2) })
        .expect(401);
    });

    it('rejects non-enrolled user with 403', async () => {
      if (!hasSeed) return;
      const email = `non-enrolled-${Date.now()}@${TEST_EMAIL_DOMAIN}`;
      await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(TEST_PASSWORD, 10),
          name: 'Outsider',
          role: 'STUDENT',
          emailVerified: true,
        },
      });
      const token = await loginAndGetToken(app, email);
      const res = await request(app.getHttpServer())
        .post(`/courses/${publishedSlug}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5, comment: 'should be blocked' })
        .expect(403);
      expect(res.body.message).toBe('not_enrolled');
    });

    it('rejects enrolled but email-unverified user with 403', async () => {
      if (!hasSeed) return;
      const email = `unverified-${Date.now()}@${TEST_EMAIL_DOMAIN}`;
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(TEST_PASSWORD, 10),
          name: 'Unverified',
          role: 'STUDENT',
          emailVerified: false,
        },
      });
      await prisma.enrollment.create({
        data: { userId: user.id, courseId: publishedId },
      });
      const token = await loginAndGetToken(app, email);
      const res = await request(app.getHttpServer())
        .post(`/courses/${publishedSlug}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 4, comment: 'unverified comment here' })
        .expect(403);
      expect(res.body.message).toBe('email_not_verified');
    });

    it('creates review for enrolled+verified user, recomputes course rating, rejects duplicate', async () => {
      if (!hasSeed) return;
      const email = `verified-${Date.now()}@${TEST_EMAIL_DOMAIN}`;
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(TEST_PASSWORD, 10),
          name: 'Verified Reviewer',
          role: 'STUDENT',
          emailVerified: true,
        },
      });
      await prisma.enrollment.create({
        data: { userId: user.id, courseId: publishedId },
      });
      const token = await loginAndGetToken(app, email);

      const before = await prisma.course.findUnique({
        where: { id: publishedId },
        select: { ratingCount: true },
      });

      await request(app.getHttpServer())
        .post(`/courses/${publishedSlug}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5, comment: 'really enjoyed this course' })
        .expect(201);

      const after = await prisma.course.findUnique({
        where: { id: publishedId },
        select: { ratingCount: true },
      });
      expect(after!.ratingCount).toBe(before!.ratingCount + 1);

      await request(app.getHttpServer())
        .post(`/courses/${publishedSlug}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 4, comment: 'cannot review twice from same user' })
        .expect(409);
    });
  });
});
