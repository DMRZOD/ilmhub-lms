import { Module } from '@nestjs/common';

import { AdminCoursesController } from './admin-courses.controller';
import { AdminCoursesService } from './admin-courses.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AdminCoursesController],
  providers: [AdminCoursesService],
})
export class AdminCoursesModule {}
