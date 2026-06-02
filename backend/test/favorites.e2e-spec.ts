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

const TEST_EMAIL_DOMAIN = 'fav-tester.ilmhub.uz';
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

d('Favorites (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let hasSeed = false;
  let courseId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    const course = await prisma.course.findFirst({
      where: { status: 'PUBLISHED' },
    });
    hasSeed = Boolean(course);
    if (!hasSeed) return;
    courseId = course!.id;
  });

  afterAll(async () => {
    if (hasSeed) {
      await prisma.wishlist.deleteMany({
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
    return loginAndGetToken(app, email);
  }

  it('GET /me/favorites rejects unauthenticated', async () => {
    if (!hasSeed) return;
    await request(app.getHttpServer()).get('/me/favorites').expect(401);
  });

  it('POST → GET → DELETE cycle is idempotent', async () => {
    if (!hasSeed) return;
    const token = await createTestUser('cycle');

    await request(app.getHttpServer())
      .post(`/favorites/${courseId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    // Idempotent add
    await request(app.getHttpServer())
      .post(`/favorites/${courseId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const list = await request(app.getHttpServer())
      .get('/me/favorites')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0].id).toBe(courseId);

    await request(app.getHttpServer())
      .delete(`/favorites/${courseId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    // Idempotent delete
    await request(app.getHttpServer())
      .delete(`/favorites/${courseId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const after = await request(app.getHttpServer())
      .get('/me/favorites')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(after.body.items).toHaveLength(0);
  });

  it('returns 404 for unknown course', async () => {
    if (!hasSeed) return;
    const token = await createTestUser('notfound');
    await request(app.getHttpServer())
      .post('/favorites/does-not-exist-xyz')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
