import { Module } from '@nestjs/common';

import { InstructorApplicationsController } from './instructor-applications.controller';
import { AdminInstructorApplicationsController } from './admin-instructor-applications.controller';
import { InstructorApplicationsService } from './instructor-applications.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [
    InstructorApplicationsController,
    AdminInstructorApplicationsController,
  ],
  providers: [InstructorApplicationsService],
})
export class InstructorApplicationsModule {}
