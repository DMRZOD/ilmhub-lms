import { Module } from '@nestjs/common';

import { MuxModule } from '../lessons/mux.module';
import { InstructorCoursesController } from './instructor-courses.controller';
import { MuxWebhookController } from './mux-webhook.controller';
import { InstructorCoursesService } from './instructor-courses.service';

@Module({
  imports: [MuxModule],
  controllers: [InstructorCoursesController, MuxWebhookController],
  providers: [InstructorCoursesService],
})
export class InstructorCoursesModule {}
