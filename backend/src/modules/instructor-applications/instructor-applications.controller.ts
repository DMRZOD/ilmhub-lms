import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { InstructorApplicationsService } from './instructor-applications.service';
import { CreateInstructorApplicationDto } from './dto/create-instructor-application.dto';

@ApiTags('instructor-applications')
@ApiBearerAuth('jwt')
@Controller('instructor-applications')
export class InstructorApplicationsController {
  constructor(
    private readonly applications: InstructorApplicationsService,
  ) {}

  @Post()
  @Roles('STUDENT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit an application to become an instructor' })
  apply(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInstructorApplicationDto,
  ) {
    return this.applications.create(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my instructor application (or null)' })
  mine(@CurrentUser('id') userId: string) {
    return this.applications.getMine(userId);
  }
}
