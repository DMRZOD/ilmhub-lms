import { Module } from '@nestjs/common';

import { CertificatesModule } from '../certificates/certificates.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { MuxModule } from './mux.module';

@Module({
  imports: [EnrollmentsModule, MuxModule, CertificatesModule],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
