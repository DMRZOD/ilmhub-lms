import { Module } from '@nestjs/common';

import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { QaController } from './qa.controller';
import { AnswersController } from './answers.controller';
import { QaService } from './qa.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [EnrollmentsModule, NotificationsModule],
  controllers: [QaController, AnswersController],
  providers: [QaService],
  exports: [QaService],
})
export class QaModule {}
