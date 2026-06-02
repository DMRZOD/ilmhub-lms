import { Module } from '@nestjs/common';

import { CoursesController } from './courses.controller';
import { ReviewsController } from './reviews.controller';
import { CoursesService } from './courses.service';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [CoursesController, ReviewsController],
  providers: [CoursesService, ReviewsService],
})
export class CoursesModule {}
