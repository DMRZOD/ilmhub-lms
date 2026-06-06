import { Module } from '@nestjs/common';

import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { AnnouncementsController } from './announcements.controller';
import { CourseAnnouncementsController } from './course-announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [NotificationsModule, EnrollmentsModule],
  controllers: [
    MessagesController,
    AnnouncementsController,
    CourseAnnouncementsController,
  ],
  providers: [MessagesService, AnnouncementsService],
})
export class MessagesModule {}
