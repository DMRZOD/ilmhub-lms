import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { AnnouncementsService } from './announcements.service';

@ApiTags('announcements')
@ApiBearerAuth('jwt')
@Controller('courses')
export class CourseAnnouncementsController {
  constructor(private readonly announcements: AnnouncementsService) {}

  @Get(':courseId/announcements')
  @ApiOperation({
    summary: 'Broadcast (ALL) announcements of a course — enrolled students',
  })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ) {
    return this.announcements.listForCourse(user, courseId);
  }
}
