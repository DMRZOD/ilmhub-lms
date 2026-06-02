import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  type RawBodyRequest,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { MuxService } from '../lessons/mux.service';
import { InstructorCoursesService } from './instructor-courses.service';

@ApiTags('webhooks')
@Controller('webhooks/mux')
export class MuxWebhookController {
  private readonly logger = new Logger(MuxWebhookController.name);

  constructor(
    private readonly mux: MuxService,
    private readonly svc: InstructorCoursesService,
  ) {}

  @Post()
  @Public()
  @SkipThrottle({ default: true, auth: true })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Mux webhook — on video.asset.ready, links the playback id + duration to the lesson and marks it READY.',
  })
  async handle(@Req() req: RawBodyRequest<Request>) {
    const raw = req.rawBody?.toString('utf8');
    if (!raw) throw new BadRequestException('missing_raw_body');

    let event: { type: string; data: Record<string, unknown> };
    try {
      event = (await this.mux.unwrapWebhook(
        raw,
        req.headers,
      )) as unknown as typeof event;
    } catch (err) {
      this.logger.warn(
        `Mux webhook signature/parse failed: ${(err as Error).message}`,
      );
      throw new BadRequestException('invalid_webhook');
    }

    return this.svc.handleMuxWebhook(event);
  }
}
