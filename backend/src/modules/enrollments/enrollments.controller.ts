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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { ListEnrollmentsDto } from './dto/list-enrollments.dto';

@ApiTags('enrollments')
@ApiBearerAuth('jwt')
@Controller()
export class EnrollmentsController {
  constructor(private readonly enrollments: EnrollmentsService) {}

  @Post('enrollments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enroll the current user in a free course (paid → 403 until step 24)',
  })
  enroll(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEnrollmentDto,
  ) {
    return this.enrollments.enroll(userId, dto.courseId);
  }

  @Get('me/enrollments')
  @ApiOperation({
    summary: 'List my enrollments with computed progress, filtered by status',
  })
  listMy(
    @CurrentUser('id') userId: string,
    @Query() query: ListEnrollmentsDto,
  ) {
    return this.enrollments.listMy(userId, query);
  }
}
