import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminCoursesService } from './admin-courses.service';
import { ListAdminCoursesDto } from './dto/list-admin-courses.dto';
import { RejectCourseDto } from './dto/reject-course.dto';
import { CourseNoteDto } from './dto/course-note.dto';

@ApiTags('admin-courses')
@ApiBearerAuth('jwt')
@Roles('ADMIN')
@Controller('admin/courses')
export class AdminCoursesController {
  constructor(private readonly courses: AdminCoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List courses for moderation, filtered by status' })
  list(@Query() query: ListAdminCoursesDto) {
    return this.courses.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Full course detail + moderation timeline (admin)' })
  detail(@Param('id') id: string) {
    return this.courses.detail(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a course → PUBLISHED + notify instructor' })
  approve(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.courses.approve(id, adminId);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a course → REJECTED + notification + email' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: RejectCourseDto,
  ) {
    return this.courses.reject(id, adminId, dto.reason);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a course → hidden from the public catalog' })
  archive(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.courses.archive(id, adminId);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add an internal moderation note for other admins' })
  addNote(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: CourseNoteDto,
  ) {
    return this.courses.addNote(id, adminId, dto.note);
  }
}
