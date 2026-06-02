import { Module } from '@nestjs/common';

import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { LessonsModule } from '../lessons/lessons.module';
import { CodingController } from './coding.controller';
import { CodingService } from './coding.service';

@Module({
  imports: [EnrollmentsModule, LessonsModule],
  controllers: [CodingController],
  providers: [CodingService],
})
export class CodingModule {}
