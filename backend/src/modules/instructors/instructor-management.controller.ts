import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PageQueryDto } from '../../common/dto/pagination.dto';
import { InstructorManagementService } from './instructor-management.service';
import { ListStudentsDto } from './dto/list-students.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';

@ApiTags('instructor')
@ApiBearerAuth('jwt')
@Roles('INSTRUCTOR', 'ADMIN')
@Controller('instructor')
export class InstructorManagementController {
  constructor(private readonly service: InstructorManagementService) {}

  @Get('students')
  @ApiOperation({ summary: 'List students enrolled in the instructor courses' })
  listStudents(
    @CurrentUser('id') instructorId: string,
    @Query() query: ListStudentsDto,
  ) {
    return this.service.listStudents(instructorId, query);
  }

  @Get('students/:studentId')
  @ApiOperation({ summary: 'Student detail: courses, progress, last activity' })
  studentDetail(
    @CurrentUser('id') instructorId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.service.getStudentDetail(instructorId, studentId);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'List reviews across the instructor courses' })
  listReviews(
    @CurrentUser('id') instructorId: string,
    @Query() query: ListReviewsDto,
  ) {
    return this.service.listReviews(instructorId, query);
  }

  @Patch('reviews/:id/reply')
  @ApiOperation({ summary: 'Reply to a review on one of the instructor courses' })
  replyReview(
    @CurrentUser('id') instructorId: string,
    @Param('id') id: string,
    @Body() dto: ReplyReviewDto,
  ) {
    return this.service.replyToReview(instructorId, id, dto.comment);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue stats, monthly chart and transactions' })
  revenue(
    @CurrentUser('id') instructorId: string,
    @Query() query: PageQueryDto,
  ) {
    return this.service.getRevenue(instructorId, query.page, query.limit);
  }
}
