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

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

const hasTestDb = !!process.env.TEST_DATABASE_URL;
const d = hasTestDb ? describe : describe.skip;

d('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "RefreshToken", "EmailVerificationToken", "PasswordResetToken", "User" RESTART IDENTITY CASCADE;',
    );
  });

  const baseUser = {
    email: 'alice@ilmhub.uz',
    password: 'sup3rsecret',
    name: 'Alice',
    role: 'STUDENT' as const,
  };

  describe('POST /auth/register', () => {
    it('creates a user, returns tokens, and stores a verification token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(baseUser)
        .expect(201);

      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));
      expect(res.body.user).toMatchObject({
        email: baseUser.email,
        name: baseUser.name,
        role: 'STUDENT',
        emailVerified: false,
      });
      expect(res.body.user.passwordHash).toBeUndefined();

      const dbUser = await prisma.user.findUnique({
        where: { email: baseUser.email },
      });
      expect(dbUser).not.toBeNull();
      const verifyToken = await prisma.emailVerificationToken.findFirst({
        where: { userId: dbUser!.id },
      });
      expect(verifyToken).not.toBeNull();
    });

    it('rejects ADMIN role', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...baseUser, role: 'ADMIN' })
        .expect(400);
    });

    it('rejects duplicate email with 409', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(baseUser)
        .expect(201);
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(baseUser)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(baseUser)
        .expect(201);
    });

    it('returns tokens on valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: baseUser.email, password: baseUser.password })
        .expect(200);
      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));
      expect(res.body.user.email).toBe(baseUser.email);
    });

    it('returns 401 on wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: baseUser.email, password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(baseUser)
        .expect(201);
      accessToken = res.body.accessToken;
    });

    it('returns the user with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.email).toBe(baseUser.email);
      expect(res.body.passwordHash).toBeUndefined();
    });

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('returns 401 with garbage token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer not-a-jwt')
        .expect(401);
    });
  });

  describe('POST /auth/refresh (rotation)', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(baseUser)
        .expect(201);
      refreshToken = res.body.refreshToken;
    });

    it('rotates the refresh token and invalidates the old one', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);
      expect(res.body.refreshToken).not.toBe(refreshToken);
      const newAccess = res.body.accessToken as string;

      // new access works
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${newAccess}`)
        .expect(200);

      // reusing the old refresh triggers reuse detection
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      const user = await prisma.user.findUnique({
        where: { email: baseUser.email },
      });
      const active = await prisma.refreshToken.count({
        where: { userId: user!.id, revokedAt: null },
      });
      expect(active).toBe(0);
    });
  });

  describe('POST /auth/logout', () => {
    it('revokes the refresh token', async () => {
      const reg = await request(app.getHttpServer())
        .post('/auth/register')
        .send(baseUser)
        .expect(201);
      const refreshToken = reg.body.refreshToken as string;

      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('GET /auth/verify-email', () => {
    it('marks the user as verified', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(baseUser)
        .expect(201);
      const dbUser = await prisma.user.findUnique({
        where: { email: baseUser.email },
      });
      const record = await prisma.emailVerificationToken.findFirst({
        where: { userId: dbUser!.id },
      });
      expect(record).not.toBeNull();

      await request(app.getHttpServer())
        .get(`/auth/verify-email?token=${record!.token}`)
        .expect(200);

      const after = await prisma.user.findUnique({
        where: { id: dbUser!.id },
      });
      expect(after!.emailVerified).toBe(true);
    });
  });

  describe('Forgot/reset password flow', () => {
    it('lets the user reset and re-login with the new password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(baseUser)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: baseUser.email })
        .expect(200);

      const dbUser = await prisma.user.findUnique({
        where: { email: baseUser.email },
      });
      const reset = await prisma.passwordResetToken.findFirst({
        where: { userId: dbUser!.id },
      });
      expect(reset).not.toBeNull();

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: reset!.token, newPassword: 'newPa$$word1' })
        .expect(200);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: baseUser.email, password: baseUser.password })
        .expect(401);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: baseUser.email, password: 'newPa$$word1' })
        .expect(200);
    });
  });

  describe('Public routes', () => {
    it('/health is reachable without auth', async () => {
      await request(app.getHttpServer()).get('/health').expect(200);
    });
  });
});

const t = hasTestDb ? describe : describe.skip;
t('Auth throttling (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "RefreshToken", "EmailVerificationToken", "PasswordResetToken", "User" RESTART IDENTITY CASCADE;',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('rate-limits /auth/register to 5 per minute', async () => {
    let last = 200;
    for (let i = 0; i < 6; i++) {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `user${i}@ilmhub.uz`,
          password: 'sup3rsecret',
          name: `User ${i}`,
          role: 'STUDENT',
        });
      last = res.status;
    }
    expect(last).toBe(429);
  });
});
