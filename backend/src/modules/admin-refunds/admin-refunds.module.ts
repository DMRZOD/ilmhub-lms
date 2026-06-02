import { Module } from '@nestjs/common';

import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { AdminRefundsController } from './admin-refunds.controller';
import { AdminRefundsService } from './admin-refunds.service';
import { RefundGatewayService } from './refund-gateway.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [EnrollmentsModule, NotificationsModule],
  controllers: [AdminRefundsController],
  providers: [AdminRefundsService, RefundGatewayService],
})
export class AdminRefundsModule {}
