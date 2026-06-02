import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { InstructorDashboardService } from './instructor-dashboard.service';

@ApiTags('instructor')
@ApiBearerAuth('jwt')
@Roles('INSTRUCTOR', 'ADMIN')
@Controller('instructor')
export class InstructorDashboardController {
  constructor(private readonly dashboard: InstructorDashboardService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Aggregated stats for the current instructor' })
  getDashboard(@CurrentUser('id') instructorId: string) {
    return this.dashboard.getDashboard(instructorId);
  }
}
