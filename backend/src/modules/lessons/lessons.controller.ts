import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { LessonsService } from './lessons.service';
import { LessonProgressDto } from './dto/lesson-progress.dto';

@ApiTags('lessons')
@ApiBearerAuth('jwt')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Get(':id')
  @ApiOperation({
    summary:
      'Get lesson detail with course curriculum + my progress. 403 if not enrolled and lesson is not preview.',
  })
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.lessons.findOneForUser(userId, id);
  }

  @Public()
  @Get(':id/preview')
  @ApiOperation({
    summary:
      'Public free-preview playback for a lesson (no auth/enrollment). 403 if the lesson is not a free preview.',
  })
  preview(@Param('id') id: string) {
    return this.lessons.getPreviewPlayback(id);
  }

  @Post(':id/playback-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Issue a Mux playback token. PUBLIC policy returns null token; SIGNED returns short-lived JWT.',
  })
  createPlaybackToken(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.lessons.createPlaybackToken(userId, id);
  }

  @Post(':id/progress')
  @SkipThrottle({ default: true, auth: true })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Record playback position and optionally mark lesson completed. Completing the last lesson flips the enrollment to completed.',
  })
  recordProgress(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: LessonProgressDto,
  ) {
    return this.lessons.recordProgress(userId, id, dto);
  }
}
