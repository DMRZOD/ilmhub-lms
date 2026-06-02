import { Module } from '@nestjs/common';

import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { OrdersController } from './orders.controller';
import { PaymentsWebhookController } from './payments-webhook.controller';
import { OrdersService } from './orders.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [EnrollmentsModule, NotificationsModule],
  controllers: [OrdersController, PaymentsWebhookController],
  providers: [OrdersService],
})
export class OrdersModule {}
