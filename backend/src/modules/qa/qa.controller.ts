import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { QaService } from './qa.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { ListQuestionsDto } from './dto/list-questions.dto';

@ApiTags('qa')
@ApiBearerAuth('jwt')
@Controller('questions')
export class QaController {
  constructor(private readonly qa: QaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ask a question on a course (optionally a lesson). Enrolled only.',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.qa.createQuestion(user, dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'List questions for a course/lesson. sort=newest|popular|unresolved, plus mine / instructorAnswered filters. Enrolled only.',
  })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListQuestionsDto,
  ) {
    return this.qa.listQuestions(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a question with its threaded answers.' })
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.qa.getQuestion(user, id);
  }

  @Post(':id/answers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Answer a question. Notifies the asker. Enrolled only.',
  })
  answer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.qa.createAnswer(user, id, dto);
  }

  @Patch(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Toggle resolved state. Author, course instructor, or admin only.',
  })
  resolve(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.qa.resolveQuestion(user, id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft-delete a question. Author, course instructor, or admin only.',
  })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.qa.removeQuestion(user, id);
  }
}
