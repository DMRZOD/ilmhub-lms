import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{ ok: true; db: 'connected' }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true, db: 'connected' };
    } catch {
      throw new ServiceUnavailableException({
        ok: false,
        db: 'disconnected',
      });
    }
  }
}
