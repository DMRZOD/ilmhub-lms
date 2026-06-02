import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { InstructorApplicationsService } from './instructor-applications.service';
import { ListInstructorApplicationsDto } from './dto/list-instructor-applications.dto';
import { RejectInstructorApplicationDto } from './dto/reject-instructor-application.dto';

@ApiTags('admin-instructor-applications')
@ApiBearerAuth('jwt')
@Roles('ADMIN')
@Controller('admin/instructor-applications')
export class AdminInstructorApplicationsController {
  constructor(
    private readonly applications: InstructorApplicationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List instructor applications (admin)' })
  list(@Query() query: ListInstructorApplicationsDto) {
    return this.applications.list(query);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve an application → applicant becomes INSTRUCTOR' })
  approve(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.applications.approve(id, adminId);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject an application with a reason' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: RejectInstructorApplicationDto,
  ) {
    return this.applications.reject(id, adminId, dto.reason);
  }
}
