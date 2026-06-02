import { Module } from '@nestjs/common';

import { InstructorsController } from './instructors.controller';
import { InstructorsService } from './instructors.service';
import { InstructorDashboardController } from './instructor-dashboard.controller';
import { InstructorDashboardService } from './instructor-dashboard.service';
import { InstructorManagementController } from './instructor-management.controller';
import { InstructorManagementService } from './instructor-management.service';
import { AdminInstructorsController } from './admin-instructors.controller';
import { AdminInstructorsService } from './admin-instructors.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [
    InstructorsController,
    InstructorDashboardController,
    InstructorManagementController,
    AdminInstructorsController,
  ],
  providers: [
    InstructorsService,
    InstructorDashboardService,
    InstructorManagementService,
    AdminInstructorsService,
  ],
})
export class InstructorsModule {}
