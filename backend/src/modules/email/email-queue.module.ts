import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { EmailModule } from './email.module';
import { EmailQueueProcessor } from './email-queue.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'email' }),
    EmailModule,
  ],
  providers: [EmailQueueProcessor],
})
export class EmailQueueModule {}
