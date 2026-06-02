import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';

import { AppModule } from './app.module';
import type { Env } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  app.useLogger(app.get(Logger));
  app.flushLogs();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  const config = app.get(ConfigService<Env, true>);
  const corsOrigin = config.get('CORS_ORIGIN', { infer: true });
  const port = config.get('PORT', { infer: true });
  const nodeEnv = config.get('NODE_ENV', { infer: true });

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.enableShutdownHooks();

  const enableSwagger = nodeEnv !== 'production';
  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('IlmHub API')
      .setDescription('IlmHub LMS backend')
      .setVersion('0.1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'jwt',
      )
      .addTag('auth')
      .addTag('users')
      .addTag('categories')
      .addTag('courses')
      .addTag('instructors')
      .build();
    const doc = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, doc);
  }

  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`IlmHub backend listening on http://localhost:${port}`);
  logger.log(`Health: http://localhost:${port}/health`);
  if (enableSwagger) {
    logger.log(`Swagger: http://localhost:${port}/api/docs`);
  }
  logger.log(`CORS origin: ${corsOrigin}`);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap IlmHub backend', error);
  process.exit(1);
});
