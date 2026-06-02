import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import type { Request, Response } from 'express';

type Mapped = {
  status: number;
  message: string;
  code?: string;
};

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(PrismaExceptionFilter.name);
  }

  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const mapped = this.map(exception);

    this.logger.warn(
      {
        path: request.url,
        method: request.method,
        prismaCode: mapped.code,
      },
      `Prisma error: ${mapped.message}`,
    );

    response.status(mapped.status).json({
      statusCode: mapped.status,
      message: mapped.message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private map(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
  ): Mapped {
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid query payload',
      };
    }

    switch (exception.code) {
      case 'P2002': {
        const target = (exception.meta?.target as string[] | undefined)?.join(
          ', ',
        );
        return {
          status: HttpStatus.CONFLICT,
          code: exception.code,
          message: target
            ? `Unique constraint failed on: ${target}`
            : 'Unique constraint failed',
        };
      }
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          code: exception.code,
          message: 'Record not found',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          code: exception.code,
          message: 'Foreign key constraint failed',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          code: exception.code,
          message: 'Database error',
        };
    }
  }
}
