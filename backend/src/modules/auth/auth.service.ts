import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { PinoLogger } from 'nestjs-pino';

import type { Env } from '../../config/env.schema';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import type { GoogleProfilePayload } from './strategies/google.strategy';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 24 * 60 * 60 * 1000;

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  role: true,
  status: true,
  name: true,
  bio: true,
  avatarUrl: true,
  emailVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends TokenPair {
  user: AuthenticatedUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly email: EmailService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Email is already registered');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        role: dto.role as UserRole,
      },
      select: PUBLIC_USER_SELECT,
    });

    const verifyToken = await this.createVerificationToken(user.id);
    await this.email.sendVerificationEmail(user.email, user.name, verifyToken);

    const tokens = await this.issueTokenPair(user.id, user.email, user.role);
    return { ...tokens, user };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const record = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!record || !record.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, record.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (record.status === 'SUSPENDED') {
      throw new ForbiddenException('account_suspended');
    }

    const lastLoginAt = new Date();
    await this.prisma.user.update({
      where: { id: record.id },
      data: { lastLoginAt },
    });

    const tokens = await this.issueTokenPair(record.id, record.email, record.role);
    const { passwordHash: _ph, googleId: _gid, ...user } = record;
    return { ...tokens, user: { ...user, lastLoginAt } };
  }

  async loginWithGoogle(profile: GoogleProfilePayload): Promise<AuthResponse> {
    const existingByGoogleId = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
      select: PUBLIC_USER_SELECT,
    });

    let user = existingByGoogleId;
    if (!user) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email: profile.email },
        select: { id: true, avatarUrl: true },
      });

      user = existingByEmail
        ? await this.prisma.user.update({
            where: { id: existingByEmail.id },
            data: {
              googleId: profile.googleId,
              emailVerified: true,
              avatarUrl: existingByEmail.avatarUrl ?? profile.avatarUrl,
            },
            select: PUBLIC_USER_SELECT,
          })
        : await this.prisma.user.create({
            data: {
              email: profile.email,
              googleId: profile.googleId,
              name: profile.name,
              avatarUrl: profile.avatarUrl,
              emailVerified: true,
              role: UserRole.STUDENT,
            },
            select: PUBLIC_USER_SELECT,
          });
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('account_suspended');
    }

    const lastLoginAt = new Date();
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt },
    });

    const tokens = await this.issueTokenPair(user.id, user.email, user.role);
    return { ...tokens, user: { ...user, lastLoginAt } };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const hashedToken = sha256(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { hashedToken },
    });

    if (!stored || stored.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      this.logger.warn(
        { userId: stored.userId, tokenId: stored.id },
        'refresh token reuse detected — revoking all sessions for user',
      );
      await this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
      select: { id: true, email: true, role: true },
    });
    if (!user) throw new UnauthorizedException('User no longer exists');

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokenPair(user.id, user.email, user.role);
  }

  async logout(refreshToken: string): Promise<void> {
    const hashedToken = sha256(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { hashedToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true, email: true, name: true },
    });
    if (!user) return;
    const token = randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });
    await this.email.sendPasswordResetEmail(user.email, user.name, token);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async verifyEmail(token: string): Promise<void> {
    if (!token) throw new BadRequestException('Token is required');
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerificationToken.delete({ where: { id: record.id } }),
    ]);
  }

  async resendVerification(dto: ResendVerificationDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true, email: true, name: true, emailVerified: true },
    });
    if (!user || user.emailVerified) return;
    const token = await this.createVerificationToken(user.id);
    await this.email.sendVerificationEmail(user.email, user.name, token);
  }

  private async createVerificationToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + EMAIL_VERIFY_TTL_MS),
      },
    });
    return token;
  }

  private async issueTokenPair(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<TokenPair> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      {
        secret: this.config.get('JWT_SECRET', { infer: true }),
        expiresIn: ACCESS_TOKEN_TTL,
      },
    );

    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, jti },
      {
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
        expiresIn: '7d',
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        id: jti,
        userId,
        hashedToken: sha256(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}
