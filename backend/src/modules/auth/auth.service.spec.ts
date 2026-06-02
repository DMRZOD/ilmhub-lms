import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import {
  createMockConfig,
  createMockLogger,
  createMockPrisma,
} from '../../test-utils/mocks';

describe('AuthService (unit)', () => {
  let prisma: any;
  let jwt: any;
  let email: any;
  let service: AuthService;

  const config = createMockConfig({
    JWT_SECRET: 'test-jwt-secret-at-least-sixteen-chars',
    JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-at-least-sixteen-chars',
    FRONTEND_URL: 'http://localhost:3000',
  });

  beforeEach(() => {
    prisma = createMockPrisma();
    jwt = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
      verifyAsync: jest.fn(),
    };
    email = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };
    service = new AuthService(prisma, jwt, config, email, createMockLogger());
  });

  const dto = {
    email: 'Alice@IlmHub.uz',
    password: 'sup3rsecret',
    name: 'Alice',
    role: 'STUDENT' as const,
  };

  describe('register', () => {
    it('throws ConflictException when the email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('lowercases the email, hashes the password, issues tokens and sends verification', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'alice@ilmhub.uz',
        name: 'Alice',
        role: 'STUDENT',
        emailVerified: false,
      });
      prisma.emailVerificationToken.create.mockResolvedValue({ id: 'v1' });
      prisma.refreshToken.create.mockResolvedValue({ id: 'r1' });

      const res = await service.register(dto);

      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      const createArg = prisma.user.create.mock.calls[0][0];
      expect(createArg.data.email).toBe('alice@ilmhub.uz');
      expect(createArg.data.role).toBe('STUDENT');
      // password is hashed, never stored in plaintext
      expect(createArg.data.passwordHash).not.toBe(dto.password);
      expect(await bcrypt.compare(dto.password, createArg.data.passwordHash)).toBe(
        true,
      );

      expect(email.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(res.accessToken).toBe('signed-token');
      expect(res.refreshToken).toBe('signed-token');
      expect(res.user.email).toBe('alice@ilmhub.uz');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: dto.email, password: dto.password }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException on a wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'alice@ilmhub.uz',
        role: 'STUDENT',
        status: 'ACTIVE',
        passwordHash: bcrypt.hashSync('correct-password', 4),
      });
      await expect(
        service.login({ email: dto.email, password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws ForbiddenException when the account is suspended', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'alice@ilmhub.uz',
        role: 'STUDENT',
        status: 'SUSPENDED',
        passwordHash: bcrypt.hashSync('correct-password', 4),
      });
      await expect(
        service.login({ email: dto.email, password: 'correct-password' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('returns tokens and strips the password hash on success', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'alice@ilmhub.uz',
        name: 'Alice',
        role: 'STUDENT',
        status: 'ACTIVE',
        googleId: null,
        passwordHash: bcrypt.hashSync('correct-password', 4),
      });
      prisma.user.update.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({ id: 'r1' });

      const res = await service.login({
        email: dto.email,
        password: 'correct-password',
      });

      expect(res.accessToken).toBe('signed-token');
      expect((res.user as Record<string, unknown>).passwordHash).toBeUndefined();
      expect((res.user as Record<string, unknown>).googleId).toBeUndefined();
      expect(res.user.email).toBe('alice@ilmhub.uz');
    });
  });

  describe('refresh', () => {
    it('detects refresh-token reuse and revokes all sessions', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: 'u1', jti: 'j1' });
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 't1',
        userId: 'u1',
        revokedAt: new Date(), // already revoked => reuse
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(service.refresh('some-refresh-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'u1', revokedAt: null }),
        }),
      );
    });

    it('throws UnauthorizedException for a token not in the store', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: 'u1', jti: 'j1' });
      prisma.refreshToken.findUnique.mockResolvedValue(null);
      await expect(service.refresh('x')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
