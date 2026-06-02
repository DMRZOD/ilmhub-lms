import { NotificationType } from '@prisma/client';

export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}
