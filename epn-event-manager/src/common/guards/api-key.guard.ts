import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { LoggerService } from '../logger/logger.service';

import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Excluir endpoints públicos (health, swagger)
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-fis-epn-key'];

    const validApiKey = this.configService.get<string>('API_KEY');

    this.logger.log(
      `API Key validation attempt from ${String(request.ip ?? 'unknown')}`,
      'ApiKeyGuard',
    );

    if (!apiKey) {
      this.logger.warn('Missing API Key header', 'ApiKeyGuard');
      throw new UnauthorizedException(
        'API Key header (X-FIS-EPN-KEY) is required',
      );
    }

    if (apiKey !== validApiKey) {
      this.logger.warn(
        `Invalid API Key provided: ${String(apiKey)}`,
        'ApiKeyGuard',
      );
      throw new UnauthorizedException('Invalid API Key');
    }

    this.logger.log('API Key validated successfully', 'ApiKeyGuard');
    return true;
  }
}
