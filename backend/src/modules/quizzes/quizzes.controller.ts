import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { QuizzesService } from './quizzes.service';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@ApiTags('quizzes')
@ApiBearerAuth('jwt')
@Controller()
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @Get('lessons/:lessonId/quiz')
  @ApiOperation({
    summary:
      'Get the quiz for a lesson with its questions (without correct answers). Enrolled or preview only.',
  })
  getForLesson(
    @CurrentUser('id') userId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.quizzes.getQuizForLesson(userId, lessonId);
  }

  @Post('quizzes/:id/attempts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Submit a quiz attempt. Returns the score; the per-question breakdown is revealed only when passed or attempts are unlimited. A passed quiz completes the lesson. Enrolled only.',
  })
  submit(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.quizzes.submitAttempt(userId, id, dto);
  }

  @Get('me/quizzes/:id/attempts')
  @ApiOperation({ summary: 'List my attempts for a quiz (most recent first).' })
  myAttempts(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.quizzes.listMyAttempts(userId, id);
  }
}
