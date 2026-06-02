import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CourseStatus } from '@prisma/client';

import type { Env } from '../../config/env.schema';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { InstructorCoursesService } from './instructor-courses.service';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateLessonContentDto } from './dto/update-lesson-content.dto';
import { UpsertCodingDto } from './dto/upsert-coding.dto';
import {
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
  UpsertQuizDto,
} from './dto/quiz.dto';
import { ReorderDto } from './dto/reorder.dto';

@ApiTags('instructor-courses')
@ApiBearerAuth('jwt')
@Roles('INSTRUCTOR', 'ADMIN')
@Controller()
export class InstructorCoursesController {
  constructor(
    private readonly svc: InstructorCoursesService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Post('courses/draft')
  @ApiOperation({ summary: 'Create an empty DRAFT course for the current instructor' })
  createDraft(@CurrentUser('id') userId: string) {
    return this.svc.createDraft(userId);
  }

  @Get('me/courses')
  @ApiOperation({ summary: 'List my courses (optional ?status filter)' })
  listMine(
    @CurrentUser('id') userId: string,
    @Query('status') status?: CourseStatus,
  ) {
    return this.svc.listMine(userId, status);
  }

  @Get('me/courses/:id')
  @ApiOperation({ summary: 'Get my course with full curriculum (wizard hydration)' })
  getMine(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.svc.getMine(id, user);
  }

  @Patch('courses/:id')
  @ApiOperation({ summary: 'Update course fields (wizard steps 1-3)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.svc.updateCourse(id, user, dto);
  }

  @Delete('courses/:id')
  @ApiOperation({ summary: 'Delete a draft course' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.svc.deleteCourse(id, user);
  }

  @Post('courses/:courseId/sections')
  @ApiOperation({ summary: 'Add a section to a course' })
  addSection(
    @Param('courseId') courseId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSectionDto,
  ) {
    return this.svc.addSection(courseId, user, dto);
  }

  @Patch('courses/:courseId/sections/reorder')
  @ApiOperation({ summary: 'Reorder sections within a course' })
  reorderSections(
    @Param('courseId') courseId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderDto,
  ) {
    return this.svc.reorderSections(courseId, user, dto);
  }

  @Patch('sections/:id')
  @ApiOperation({ summary: 'Rename a section' })
  updateSection(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.svc.updateSection(id, user, dto);
  }

  @Delete('sections/:id')
  @ApiOperation({ summary: 'Delete a section' })
  deleteSection(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.svc.deleteSection(id, user);
  }

  @Post('sections/:sectionId/lessons')
  @ApiOperation({ summary: 'Add a lesson to a section' })
  addLesson(
    @Param('sectionId') sectionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateLessonDto,
  ) {
    return this.svc.addLesson(sectionId, user, dto);
  }

  @Patch('sections/:sectionId/lessons/reorder')
  @ApiOperation({ summary: 'Reorder lessons within a section' })
  reorderLessons(
    @Param('sectionId') sectionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderDto,
  ) {
    return this.svc.reorderLessons(sectionId, user, dto);
  }

  @Patch('lessons/:id')
  @ApiOperation({ summary: 'Update a lesson (title, description, type, isPreview)' })
  updateLesson(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.svc.updateLesson(id, user, dto);
  }

  @Delete('lessons/:id')
  @ApiOperation({ summary: 'Delete a lesson' })
  deleteLesson(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.svc.deleteLesson(id, user);
  }

  // ----------------------------------------------------- lesson content (§5)
  @Post('lessons/:id/video-upload')
  @ApiOperation({
    summary:
      'Create a Mux Direct Upload URL for a VIDEO lesson. The browser PUTs the file straight to Mux.',
  })
  createVideoUpload(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('origin') origin?: string,
  ) {
    const corsOrigin =
      origin || this.config.get('CORS_ORIGIN', { infer: true }) || '*';
    return this.svc.createVideoUpload(id, user, corsOrigin);
  }

  @Patch('lessons/:id/content')
  @ApiOperation({
    summary: 'Update lesson article content, resources, and preview flag',
  })
  updateLessonContent(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateLessonContentDto,
  ) {
    return this.svc.updateLessonContent(id, user, dto);
  }

  // --------------------------------------------------------- coding (§6)
  @Patch('lessons/:id/coding')
  @ApiOperation({ summary: 'Upsert the coding exercise for a CODING lesson' })
  upsertCoding(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertCodingDto,
  ) {
    return this.svc.upsertCoding(id, user, dto);
  }

  // ----------------------------------------------------------- quiz (§7)
  @Patch('lessons/:id/quiz')
  @ApiOperation({ summary: 'Upsert quiz settings for a QUIZ lesson' })
  upsertQuiz(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertQuizDto,
  ) {
    return this.svc.upsertQuiz(id, user, dto);
  }

  @Post('lessons/:id/quiz/questions')
  @ApiOperation({ summary: 'Add a question to a quiz lesson' })
  addQuizQuestion(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateQuizQuestionDto,
  ) {
    return this.svc.addQuizQuestion(id, user, dto);
  }

  @Patch('lessons/:id/quiz/questions/reorder')
  @ApiOperation({ summary: 'Reorder questions within a quiz' })
  reorderQuizQuestions(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderDto,
  ) {
    return this.svc.reorderQuizQuestions(id, user, dto);
  }

  @Patch('quiz-questions/:id')
  @ApiOperation({ summary: 'Edit a quiz question' })
  updateQuizQuestion(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateQuizQuestionDto,
  ) {
    return this.svc.updateQuizQuestion(id, user, dto);
  }

  @Delete('quiz-questions/:id')
  @ApiOperation({ summary: 'Delete a quiz question' })
  deleteQuizQuestion(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.svc.deleteQuizQuestion(id, user);
  }

  // -------------------------------------------------------- publish (§8)
  @Patch('courses/:id/submit-for-review')
  @ApiOperation({
    summary:
      'Submit a course for admin review (DRAFT → PENDING_REVIEW). Blocked unless the publish checklist passes.',
  })
  submitForReview(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.svc.submitForReview(id, user);
  }
}
