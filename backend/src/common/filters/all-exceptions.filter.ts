import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttp ? exception.getResponse() : null;
    const baseMessage =
      isHttp && typeof responseBody === 'object' && responseBody !== null
        ? (responseBody as Record<string, unknown>)
        : { message: isHttp ? exception.message : 'Internal server error' };

    if (!isHttp) {
      this.logger.error(
        {
          path: request.url,
          method: request.method,
          err: exception,
        },
        'Unhandled exception',
      );
    }

    response.status(status).json({
      statusCode: status,
      ...baseMessage,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
