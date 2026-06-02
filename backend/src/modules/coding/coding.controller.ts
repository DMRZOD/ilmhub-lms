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
import { CodingService } from './coding.service';
import { SubmitCodeDto } from './dto/submit-code.dto';

@ApiTags('coding')
@ApiBearerAuth('jwt')
@Controller()
export class CodingController {
  constructor(private readonly coding: CodingService) {}

  @Get('lessons/:lessonId/coding')
  @ApiOperation({
    summary:
      'Get coding exercise for a lesson (no expected outputs exposed). Enrolled or preview only.',
  })
  getForLesson(
    @CurrentUser('id') userId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.coding.getExerciseForLesson(userId, lessonId);
  }

  @Post('coding-exercises/:id/submit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Submit code against all test cases. Passes → lesson marked complete. Enrolled only.',
  })
  submit(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SubmitCodeDto,
  ) {
    return this.coding.submitCode(userId, id, dto);
  }

  @Get('coding-exercises/:id/solution')
  @ApiOperation({
    summary: 'Get solution code for an exercise. Enrolled only.',
  })
  getSolution(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.coding.getSolution(userId, id);
  }

  @Get('me/coding-submissions/:exerciseId')
  @ApiOperation({ summary: 'List my submissions for a coding exercise (most recent first).' })
  mySubmissions(
    @CurrentUser('id') userId: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.coding.getMySubmissions(userId, exerciseId);
  }
}
