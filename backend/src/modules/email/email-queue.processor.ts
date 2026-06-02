import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';

import { EmailService } from './email.service';
import type { EmailJobData } from './email-queue.types';

@Processor('email')
export class EmailQueueProcessor extends WorkerHost {
  constructor(
    private readonly email: EmailService,
    private readonly logger: PinoLogger,
  ) {
    super();
    this.logger.setContext(EmailQueueProcessor.name);
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { kind, to, name, title, body, link } = job.data;

    try {
      switch (kind) {
        case 'qa-answer':
          await this.email.sendQaAnswerEmail(to, name, { title, body, link });
          break;
        case 'new-question':
          await this.email.sendNewQuestionEmail(to, name, { title, body, link });
          break;
        case 'course-approved':
          await this.email.sendCourseApprovedEmail(to, name, { title, link });
          break;
        case 'new-message':
          await this.email.sendNewMessageEmail(to, name, { title, body, link });
          break;
        case 'course-update':
          await this.email.sendCourseUpdateEmail(to, name, { title, body, link });
          break;
        default:
          this.logger.warn({ kind }, 'unknown email job kind — skipping');
      }
    } catch (err) {
      this.logger.warn({ err, kind, to }, 'email job failed — will retry');
      throw err;
    }
  }
}
