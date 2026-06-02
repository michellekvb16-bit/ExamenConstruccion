import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message: unknown =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as Error).message };

    const responseContent = message as Record<string, unknown>;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error:
        typeof message === 'string'
          ? message
          : (responseContent.error as string) || 'Internal Server Error',
      message:
        typeof message === 'string'
          ? message
          : (responseContent.message as string) || (exception as Error).message,
    };

    // Log the error for internal auditing (Mantenimiento Correctivo)
    this.logger.error(
      `${request.method} ${request.url} - Error: ${JSON.stringify(errorResponse)}`,
      (exception as Error).stack || '',
      'AllExceptionsFilter',
    );

    response.status(status).json(errorResponse);
  }
}
