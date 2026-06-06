import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PageQueryDto } from '../../common/dto/pagination.dto';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { StartConversationDto } from './dto/start-conversation.dto';
import { StartWithInstructorDto } from './dto/start-with-instructor.dto';

@ApiTags('messages')
@ApiBearerAuth('jwt')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'List my conversations with last message + unread' })
  listConversations(@CurrentUser('id') userId: string) {
    return this.messages.listConversations(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Total unread messages for the current user' })
  unreadCount(@CurrentUser('id') userId: string) {
    return this.messages.unreadCount(userId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Messages in a conversation (marks incoming read)' })
  getConversation(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Query() query: PageQueryDto,
  ) {
    return this.messages.getConversation(userId, id, query.page, query.limit);
  }

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start (or find) a conversation with a student' })
  start(
    @CurrentUser('id') instructorId: string,
    @Body() dto: StartConversationDto,
  ) {
    return this.messages.startConversation(instructorId, dto);
  }

  @Post('conversations/with-instructor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start (or find) a conversation with an enrolled course instructor',
  })
  startWithInstructor(
    @CurrentUser('id') studentId: string,
    @Body() dto: StartWithInstructorDto,
  ) {
    return this.messages.startConversationWithInstructor(
      studentId,
      dto.instructorId,
      dto.body,
    );
  }

  @Post('conversations/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message in a conversation' })
  send(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messages.sendMessage(userId, id, dto.body);
  }
}
