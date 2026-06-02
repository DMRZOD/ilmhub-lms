import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { QaService } from './qa.service';
import { VoteAnswerDto } from './dto/vote-answer.dto';

@ApiTags('qa')
@ApiBearerAuth('jwt')
@Controller('answers')
export class AnswersController {
  constructor(private readonly qa: QaService) {}

  @Post(':id/vote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vote on an answer (direction 1 or -1). Enrolled only.',
  })
  vote(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: VoteAnswerDto,
  ) {
    return this.qa.voteAnswer(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft-delete an answer. Author, course instructor, or admin only.',
  })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.qa.removeAnswer(user, id);
  }
}
