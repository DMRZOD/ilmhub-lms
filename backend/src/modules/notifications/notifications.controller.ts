import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  MessageEvent,
  Param,
  Patch,
  Put,
  Query,
  Sse,
} from '@nestjs/common';
import { Body } from '@nestjs/common';
import { Observable } from 'rxjs';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Controller('users')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('me/notifications')
  list(
    @CurrentUser('id') userId: string,
    @Query() query: ListNotificationsDto,
  ) {
    return this.notifications.list(userId, query);
  }

  @Sse('me/notifications/stream')
  stream(@CurrentUser('id') userId: string): Observable<MessageEvent> {
    return this.notifications.subscribe(userId);
  }

  @Patch('me/notifications')
  @HttpCode(HttpStatus.OK)
  markAllRead(@CurrentUser('id') userId: string) {
    return this.notifications.markAllRead(userId);
  }

  @Patch('me/notifications/:id')
  @HttpCode(HttpStatus.OK)
  markRead(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notifications.markRead(userId, id);
  }

  @Delete('me/notifications/:id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notifications.remove(userId, id);
  }

  @Get('me/notification-preferences')
  getPreferences(@CurrentUser('id') userId: string) {
    return this.notifications.getPreferences(userId);
  }

  @Put('me/notification-preferences')
  @HttpCode(HttpStatus.OK)
  updatePreferences(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.notifications.updatePreferences(userId, dto);
  }
}
