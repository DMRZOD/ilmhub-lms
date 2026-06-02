import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PageQueryDto } from '../../common/dto/pagination.dto';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@ApiTags('instructor')
@ApiBearerAuth('jwt')
@Roles('INSTRUCTOR', 'ADMIN')
@Controller('instructor/announcements')
export class AnnouncementsController {
  constructor(private readonly announcements: AnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: 'List announcements sent by the instructor' })
  list(
    @CurrentUser('id') instructorId: string,
    @Query() query: PageQueryDto,
  ) {
    return this.announcements.list(instructorId, query.page, query.limit);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send an announcement to course students' })
  create(
    @CurrentUser('id') instructorId: string,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.announcements.create(instructorId, dto);
  }
}
