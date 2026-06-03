import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { randomUUID } from 'node:crypto';

import { validateEnv } from './config/validate-env';
import type { Env } from './config/env.schema';
import { PrismaModule } from './modules/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmailModule } from './modules/email/email.module';
import { AuditModule } from './modules/audit/audit.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { OrdersModule } from './modules/orders/orders.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { NotesModule } from './modules/notes/notes.module';
import { QaModule } from './modules/qa/qa.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { CodingModule } from './modules/coding/coding.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { InstructorsModule } from './modules/instructors/instructors.module';
import { InstructorApplicationsModule } from './modules/instructor-applications/instructor-applications.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { InstructorCoursesModule } from './modules/instructor-courses/instructor-courses.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AdminAnalyticsModule } from './modules/admin-analytics/admin-analytics.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { AdminCoursesModule } from './modules/admin-courses/admin-courses.module';
import { AdminRefundsModule } from './modules/admin-refunds/admin-refunds.module';
import { AdminReviewsModule } from './modules/admin-reviews/admin-reviews.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AdminBlogModule } from './modules/admin-blog/admin-blog.module';
import { AdminCmsModule } from './modules/admin-cms/admin-cms.module';
import { AdminSettingsModule } from './modules/admin-settings/admin-settings.module';
import { ContentModule } from './modules/content/content.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailQueueModule } from './modules/email/email-queue.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Must be the first import so Sentry can instrument the rest of the app.
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const nodeEnv = config.get('NODE_ENV', { infer: true });
        const isDev = nodeEnv !== 'production';
        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            genReqId: (req) =>
              (req.headers['x-request-id'] as string | undefined) ??
              randomUUID(),
            transport: isDev
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    colorize: true,
                    translateTime: 'HH:MM:ss.l',
                    ignore: 'pid,hostname,req,res,responseTime',
                    messageFormat: '{msg} {req.method} {req.url}',
                  },
                }
              : undefined,
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.body.newPassword',
                'req.body.passwordHash',
                'req.body.refreshToken',
                'req.body.token',
              ],
              censor: '[Redacted]',
            },
          },
        };
      },
    }),
    ThrottlerModule.forRoot({
      // Disabled under test so e2e suites can hammer auth endpoints without
      // tripping the rate limiter; stays enabled in dev/production.
      skipIf: () => process.env.NODE_ENV === 'test',
      throttlers: [
        {
          name: 'default',
          ttl: 1000,
          limit: 10,
        },
        {
          name: 'auth',
          ttl: 60_000,
          limit: 5,
        },
      ],
    }),
    // Two-tier cache: a fast in-process LRU fronting a shared Redis store so
    // cached reads (e.g. /courses/featured, /categories) survive restarts and
    // are consistent across instances. Falls back to localhost like BullMQ.
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const redisUrl =
          config.get('REDIS_URL', { infer: true }) ?? 'redis://localhost:6379';
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60_000, lruSize: 1000 }),
            }),
            createKeyv(redisUrl),
          ],
        };
      },
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        connection: {
          url: config.get('REDIS_URL', { infer: true }) ?? 'redis://localhost:6379',
        },
      }),
    }),
    PrismaModule,
    EmailModule,
    AuditModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    CoursesModule,
    EnrollmentsModule,
    OrdersModule,
    LessonsModule,
    NotesModule,
    QaModule,
    QuizzesModule,
    CodingModule,
    FavoritesModule,
    InstructorsModule,
    InstructorApplicationsModule,
    CertificatesModule,
    AchievementsModule,
    UploadsModule,
    InstructorCoursesModule,
    MessagesModule,
    AdminAnalyticsModule,
    AdminUsersModule,
    AdminCoursesModule,
    AdminRefundsModule,
    AdminReviewsModule,
    SettingsModule,
    AdminBlogModule,
    AdminCmsModule,
    AdminSettingsModule,
    ContentModule,
    NotificationsModule,
    EmailQueueModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
