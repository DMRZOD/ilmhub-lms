import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus, MuxAssetStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service';
import { MuxService } from '../lessons/mux.service';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
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
import { buildPublishChecklist } from './publish-checklist';

const courseWithCurriculum = {
  sections: {
    orderBy: { order: 'asc' as const },
    include: {
      lessons: {
        orderBy: { order: 'asc' as const },
        include: {
          codingExercise: true,
          quiz: { include: { questions: { orderBy: { order: 'asc' as const } } } },
        },
      },
    },
  },
};

type CourseWithCurriculum = Prisma.CourseGetPayload<{
  include: typeof courseWithCurriculum;
}>;

@Injectable()
export class InstructorCoursesService {
  private readonly logger = new Logger(InstructorCoursesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mux: MuxService,
  ) {}

  async createDraft(userId: string) {
    const category = await this.prisma.category.findFirst({
      orderBy: { sortOrder: 'asc' },
    });
    if (!category) throw new BadRequestException('no_categories_configured');

    return this.prisma.course.create({
      data: {
        title: '',
        description: '',
        slug: `draft-${randomUUID()}`,
        instructorId: userId,
        categoryId: category.id,
        status: 'DRAFT',
      },
      select: { id: true },
    });
  }

  async listMine(userId: string, status?: CourseStatus) {
    const where: Prisma.CourseWhereInput = { instructorId: userId };
    if (status) where.status = status;

    const items = await this.prisma.course.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        thumbnailUrl: true,
        studentsCount: true,
        lessonsCount: true,
        durationMinutes: true,
        priceUsdCents: true,
        updatedAt: true,
      },
    });
    return { items };
  }

  async getMine(id: string, user: AuthenticatedUser) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: courseWithCurriculum,
    });
    if (!course) throw new NotFoundException('course_not_found');
    this.assertOwner(course, user);
    return this.shape(course);
  }

  async updateCourse(id: string, user: AuthenticatedUser, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('course_not_found');
    this.assertOwner(course, user);

    const data: Prisma.CourseUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.subtitle !== undefined) data.subtitle = dto.subtitle;
    if (dto.level !== undefined) data.level = dto.level;
    if (dto.language !== undefined) data.language = dto.language;
    if (dto.priceUsdCents !== undefined) data.priceUsdCents = dto.priceUsdCents;
    if (dto.discountUsdCents !== undefined)
      data.discountUsdCents = dto.discountUsdCents;
    if (dto.thumbnailUrl !== undefined) data.thumbnailUrl = dto.thumbnailUrl;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.longDescription !== undefined)
      data.longDescription = dto.longDescription;
    if (dto.learningOutcomes !== undefined)
      data.learningOutcomes = dto.learningOutcomes;
    if (dto.requirements !== undefined) data.requirements = dto.requirements;

    // Edit-published rule (ТЗ п.7): changing price is a "critical" edit and sends a
    // live course back for review. Non-critical fields (title, description, thumbnail,
    // outcomes…) stay PUBLISHED.
    if (course.status === 'PUBLISHED') {
      const priceChanged =
        dto.priceUsdCents !== undefined &&
        dto.priceUsdCents !== course.priceUsdCents;
      const discountChanged =
        dto.discountUsdCents !== undefined &&
        dto.discountUsdCents !== course.discountUsdCents;
      if (priceChanged || discountChanged) {
        data.status = 'PENDING_REVIEW';
      }
    }

    if (dto.categoryId !== undefined) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) throw new BadRequestException('category_not_found');
      data.category = { connect: { id: dto.categoryId } };
    }

    // Generate a slug from the title while the course still has a draft slug.
    if (
      dto.title &&
      dto.title.trim().length > 0 &&
      course.slug.startsWith('draft-')
    ) {
      data.slug = await this.uniqueSlug(dto.title, id);
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data,
      include: courseWithCurriculum,
    });
    return this.shape(updated);
  }

  async deleteCourse(id: string, user: AuthenticatedUser) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('course_not_found');
    this.assertOwner(course, user);
    if (course.status === 'PUBLISHED') {
      throw new BadRequestException('cannot_delete_published');
    }
    await this.prisma.course.delete({ where: { id } });
    return { success: true };
  }

  // ---------------------------------------------------------------- sections
  async addSection(
    courseId: string,
    user: AuthenticatedUser,
    dto: CreateSectionDto,
  ) {
    await this.requireOwnedCourse(courseId, user);
    const max = await this.prisma.section.aggregate({
      where: { courseId },
      _max: { order: true },
    });
    const section = await this.prisma.section.create({
      data: { courseId, title: dto.title, order: (max._max.order ?? -1) + 1 },
    });
    await this.recount(courseId);
    await this.flipPublishedToReview(courseId);
    return section;
  }

  async updateSection(
    sectionId: string,
    user: AuthenticatedUser,
    dto: UpdateSectionDto,
  ) {
    await this.requireOwnedSection(sectionId, user);
    return this.prisma.section.update({
      where: { id: sectionId },
      data: { title: dto.title },
    });
  }

  async deleteSection(sectionId: string, user: AuthenticatedUser) {
    const section = await this.requireOwnedSection(sectionId, user);
    await this.prisma.section.delete({ where: { id: sectionId } });
    await this.normalizeSectionOrders(section.courseId);
    await this.recount(section.courseId);
    await this.flipPublishedToReview(section.courseId);
    return { success: true };
  }

  async reorderSections(
    courseId: string,
    user: AuthenticatedUser,
    dto: ReorderDto,
  ) {
    await this.requireOwnedCourse(courseId, user);
    const sections = await this.prisma.section.findMany({
      where: { courseId },
      select: { id: true },
    });
    this.assertSameSet(
      sections.map((s) => s.id),
      dto.orderedIds,
    );
    await this.prisma.$transaction([
      ...dto.orderedIds.map((id, i) =>
        this.prisma.section.update({ where: { id }, data: { order: 1000 + i } }),
      ),
      ...dto.orderedIds.map((id, i) =>
        this.prisma.section.update({ where: { id }, data: { order: i } }),
      ),
    ]);
    await this.flipPublishedToReview(courseId);
    return { success: true };
  }

  // ----------------------------------------------------------------- lessons
  async addLesson(
    sectionId: string,
    user: AuthenticatedUser,
    dto: CreateLessonDto,
  ) {
    const section = await this.requireOwnedSection(sectionId, user);
    const max = await this.prisma.lesson.aggregate({
      where: { sectionId },
      _max: { order: true },
    });
    const lesson = await this.prisma.lesson.create({
      data: {
        sectionId,
        title: dto.title,
        type: dto.type,
        order: (max._max.order ?? -1) + 1,
      },
    });
    await this.recount(section.courseId);
    await this.flipPublishedToReview(section.courseId);
    return lesson;
  }

  async updateLesson(
    lessonId: string,
    user: AuthenticatedUser,
    dto: UpdateLessonDto,
  ) {
    const { courseId } = await this.requireOwnedLesson(lessonId, user);
    const data: Prisma.LessonUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.isPreview !== undefined) data.isPreview = dto.isPreview;
    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data,
    });
    // A lesson type change is a structural curriculum edit → re-review.
    if (dto.type !== undefined) await this.flipPublishedToReview(courseId);
    return updated;
  }

  async deleteLesson(lessonId: string, user: AuthenticatedUser) {
    const { courseId, sectionId, videoAssetId } = await this.requireOwnedLesson(
      lessonId,
      user,
    );
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    // Free the Mux asset too — otherwise deleted lessons leak assets and
    // eventually exhaust the plan's asset cap. Reference-counted so a shared
    // asset isn't pulled out from under other lessons still using it.
    if (videoAssetId) {
      await this.deleteMuxAssetIfUnreferenced(videoAssetId);
    }
    await this.normalizeLessonOrders(sectionId);
    await this.recount(courseId);
    await this.flipPublishedToReview(courseId);
    return { success: true };
  }

  async reorderLessons(
    sectionId: string,
    user: AuthenticatedUser,
    dto: ReorderDto,
  ) {
    const section = await this.requireOwnedSection(sectionId, user);
    const lessons = await this.prisma.lesson.findMany({
      where: { sectionId },
      select: { id: true },
    });
    this.assertSameSet(
      lessons.map((l) => l.id),
      dto.orderedIds,
    );
    await this.prisma.$transaction([
      ...dto.orderedIds.map((id, i) =>
        this.prisma.lesson.update({ where: { id }, data: { order: 1000 + i } }),
      ),
      ...dto.orderedIds.map((id, i) =>
        this.prisma.lesson.update({ where: { id }, data: { order: i } }),
      ),
    ]);
    await this.flipPublishedToReview(section.courseId);
    return { success: true };
  }

  // -------------------------------------------------------- lesson content (§5)
  /** POST /lessons/:id/video-upload — create a Mux Direct Upload for a VIDEO lesson. */
  async createVideoUpload(
    lessonId: string,
    user: AuthenticatedUser,
    corsOrigin: string,
  ) {
    const { courseId, videoAssetId: previousAssetId } =
      await this.requireOwnedLesson(lessonId, user);
    // Replacing a video orphans the old asset on Mux; delete it first so we both
    // free a slot (the free plan caps the account at 10 assets) and don't leak.
    // Reference-counted: assets may be shared across lessons, so only delete
    // once no *other* lesson still points at it.
    if (previousAssetId) {
      await this.deleteMuxAssetIfUnreferenced(previousAssetId, lessonId);
    }
    const upload = await this.mux.createDirectUpload(corsOrigin, lessonId);
    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        muxUploadId: upload.uploadId,
        muxAssetStatus: MuxAssetStatus.UPLOADING,
        // Replacing a video clears the previous playable asset until ready again.
        videoAssetId: null,
        muxPlaybackId: null,
      },
    });
    await this.flipPublishedToReview(courseId);
    return { uploadId: upload.uploadId, url: upload.url };
  }

  /**
   * Delete a Mux asset only if no lesson still references it. The same asset can
   * back several lessons (e.g. shared demo videos), so a blind delete on replace
   * or lesson-removal would break every other lesson pointing at it.
   */
  private async deleteMuxAssetIfUnreferenced(
    assetId: string,
    exceptLessonId?: string,
  ) {
    const stillUsed = await this.prisma.lesson.count({
      where: {
        videoAssetId: assetId,
        ...(exceptLessonId ? { id: { not: exceptLessonId } } : {}),
      },
    });
    if (stillUsed === 0) {
      await this.mux.deleteAsset(assetId);
    }
  }

  /** PATCH /lessons/:id/content — article body, downloadable resources, preview flag. */
  async updateLessonContent(
    lessonId: string,
    user: AuthenticatedUser,
    dto: UpdateLessonContentDto,
  ) {
    const { courseId } = await this.requireOwnedLesson(lessonId, user);
    const data: Prisma.LessonUpdateInput = {};
    if (dto.articleContent !== undefined) data.articleContent = dto.articleContent;
    if (dto.isPreview !== undefined) data.isPreview = dto.isPreview;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.resources !== undefined) {
      data.resources = dto.resources as unknown as Prisma.InputJsonValue;
    }
    const lesson = await this.prisma.lesson.update({
      where: { id: lessonId },
      data,
    });
    if (dto.articleContent !== undefined || dto.resources !== undefined) {
      await this.flipPublishedToReview(courseId);
    }
    return lesson;
  }

  // -------------------------------------------------------- coding exercise (§6)
  /** PUT /lessons/:id/coding — upsert the coding exercise for a CODING lesson. */
  async upsertCoding(
    lessonId: string,
    user: AuthenticatedUser,
    dto: UpsertCodingDto,
  ) {
    const { courseId } = await this.requireOwnedLesson(lessonId, user);
    const tests = dto.tests as unknown as Prisma.InputJsonValue;
    const exercise = await this.prisma.codingExercise.upsert({
      where: { lessonId },
      create: {
        lessonId,
        language: dto.language,
        entryFunction: dto.entryFunction,
        starterCode: dto.starterCode,
        solutionCode: dto.solutionCode,
        tests,
      },
      update: {
        language: dto.language,
        entryFunction: dto.entryFunction,
        starterCode: dto.starterCode,
        solutionCode: dto.solutionCode,
        tests,
      },
    });
    await this.flipPublishedToReview(courseId);
    return exercise;
  }

  // ----------------------------------------------------------------- quiz (§7)
  /** PUT /lessons/:id/quiz — upsert quiz settings (passingScore, attemptsAllowed). */
  async upsertQuiz(
    lessonId: string,
    user: AuthenticatedUser,
    dto: UpsertQuizDto,
  ) {
    const { courseId } = await this.requireOwnedLesson(lessonId, user);
    const quiz = await this.prisma.quiz.upsert({
      where: { lessonId },
      create: {
        lessonId,
        passingScore: dto.passingScore,
        attemptsAllowed: dto.attemptsAllowed,
      },
      update: {
        passingScore: dto.passingScore,
        attemptsAllowed: dto.attemptsAllowed,
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    await this.flipPublishedToReview(courseId);
    return quiz;
  }

  /** POST /lessons/:id/quiz/questions — add a question (creates the quiz if missing). */
  async addQuizQuestion(
    lessonId: string,
    user: AuthenticatedUser,
    dto: CreateQuizQuestionDto,
  ) {
    const { courseId } = await this.requireOwnedLesson(lessonId, user);
    const quiz = await this.prisma.quiz.upsert({
      where: { lessonId },
      create: { lessonId },
      update: {},
      select: { id: true },
    });
    const max = await this.prisma.quizQuestion.aggregate({
      where: { quizId: quiz.id },
      _max: { order: true },
    });
    const question = await this.prisma.quizQuestion.create({
      data: {
        quizId: quiz.id,
        type: dto.type,
        text: dto.text,
        options: (dto.options ?? []) as unknown as Prisma.InputJsonValue,
        correctAnswerIds: dto.correctAnswerIds,
        explanation: dto.explanation ?? null,
        order: (max._max.order ?? -1) + 1,
      },
    });
    await this.flipPublishedToReview(courseId);
    return question;
  }

  /** PATCH /quiz-questions/:id — edit a question. */
  async updateQuizQuestion(
    questionId: string,
    user: AuthenticatedUser,
    dto: UpdateQuizQuestionDto,
  ) {
    const { courseId } = await this.requireOwnedQuestion(questionId, user);
    const data: Prisma.QuizQuestionUpdateInput = {};
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.text !== undefined) data.text = dto.text;
    if (dto.options !== undefined) {
      data.options = dto.options as unknown as Prisma.InputJsonValue;
    }
    if (dto.correctAnswerIds !== undefined) {
      data.correctAnswerIds = dto.correctAnswerIds;
    }
    if (dto.explanation !== undefined) data.explanation = dto.explanation;
    const question = await this.prisma.quizQuestion.update({
      where: { id: questionId },
      data,
    });
    await this.flipPublishedToReview(courseId);
    return question;
  }

  /** DELETE /quiz-questions/:id */
  async deleteQuizQuestion(questionId: string, user: AuthenticatedUser) {
    const { courseId, quizId } = await this.requireOwnedQuestion(
      questionId,
      user,
    );
    await this.prisma.quizQuestion.delete({ where: { id: questionId } });
    await this.normalizeQuestionOrders(quizId);
    await this.flipPublishedToReview(courseId);
    return { success: true };
  }

  /** PATCH /lessons/:id/quiz/questions/reorder */
  async reorderQuizQuestions(
    lessonId: string,
    user: AuthenticatedUser,
    dto: ReorderDto,
  ) {
    const { courseId } = await this.requireOwnedLesson(lessonId, user);
    const quiz = await this.prisma.quiz.findUnique({
      where: { lessonId },
      select: { id: true },
    });
    if (!quiz) throw new NotFoundException('quiz_not_found');
    const questions = await this.prisma.quizQuestion.findMany({
      where: { quizId: quiz.id },
      select: { id: true },
    });
    this.assertSameSet(
      questions.map((q) => q.id),
      dto.orderedIds,
    );
    await this.prisma.$transaction([
      ...dto.orderedIds.map((id, i) =>
        this.prisma.quizQuestion.update({
          where: { id },
          data: { order: 1000 + i },
        }),
      ),
      ...dto.orderedIds.map((id, i) =>
        this.prisma.quizQuestion.update({ where: { id }, data: { order: i } }),
      ),
    ]);
    await this.flipPublishedToReview(courseId);
    return { success: true };
  }

  // -------------------------------------------------------------- publish (§8)
  /** PATCH /courses/:id/submit-for-review — gate on the publish checklist. */
  async submitForReview(id: string, user: AuthenticatedUser) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: courseWithCurriculum,
    });
    if (!course) throw new NotFoundException('course_not_found');
    this.assertOwner(course, user);
    if (course.status === 'PENDING_REVIEW') {
      throw new BadRequestException('already_in_review');
    }

    const checklist = buildPublishChecklist(course);
    const missing = checklist.filter((c) => !c.ok).map((c) => c.key);
    if (missing.length > 0) {
      throw new BadRequestException({ error: 'incomplete_course', missing });
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: { status: 'PENDING_REVIEW' },
      include: courseWithCurriculum,
    });
    return this.shape(updated);
  }

  // ------------------------------------------------------------ webhook (§5/6)
  /**
   * Mux fires this after async asset processing. We correlate by `passthrough`
   * (= lessonId, set when creating the upload) on asset events, and by upload id
   * for upload-level events.
   */
  async handleMuxWebhook(event: {
    type: string;
    data: Record<string, unknown>;
  }) {
    const data = event.data ?? {};
    switch (event.type) {
      case 'video.asset.ready': {
        const lessonId = (data.passthrough as string | undefined) ?? null;
        if (!lessonId) break;
        const playbackId =
          (data.playback_ids as Array<{ id: string }> | undefined)?.[0]?.id ??
          null;
        const duration = Math.round((data.duration as number | undefined) ?? 0);
        await this.applyAssetReady(
          lessonId,
          data.id as string,
          playbackId,
          duration,
        );
        break;
      }
      case 'video.asset.errored': {
        const lessonId = (data.passthrough as string | undefined) ?? null;
        if (lessonId) {
          await this.prisma.lesson.updateMany({
            where: { id: lessonId },
            data: { muxAssetStatus: MuxAssetStatus.ERRORED },
          });
        }
        break;
      }
      case 'video.upload.asset_created': {
        const uploadId = data.id as string | undefined;
        const assetId = data.asset_id as string | undefined;
        if (uploadId && assetId) {
          await this.prisma.lesson.updateMany({
            where: { muxUploadId: uploadId },
            data: { videoAssetId: assetId, muxAssetStatus: MuxAssetStatus.PROCESSING },
          });
        }
        break;
      }
      case 'video.upload.errored':
      case 'video.upload.cancelled': {
        const uploadId = data.id as string | undefined;
        if (uploadId) {
          await this.prisma.lesson.updateMany({
            where: { muxUploadId: uploadId },
            data: { muxAssetStatus: MuxAssetStatus.ERRORED },
          });
        }
        break;
      }
      default:
        this.logger.debug(`Ignoring Mux webhook ${event.type}`);
    }
    return { received: true };
  }

  private async applyAssetReady(
    lessonId: string,
    assetId: string,
    playbackId: string | null,
    durationSeconds: number,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, section: { select: { courseId: true } } },
    });
    if (!lesson) {
      this.logger.warn(`Mux asset.ready for unknown lesson ${lessonId}`);
      return;
    }
    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        videoAssetId: assetId,
        muxPlaybackId: playbackId,
        durationSeconds,
        muxAssetStatus: MuxAssetStatus.READY,
      },
    });
    await this.recount(lesson.section.courseId);
  }

  // ----------------------------------------------------------------- helpers
  private assertOwner(
    course: { instructorId: string },
    user: AuthenticatedUser,
  ) {
    if (user.role !== 'ADMIN' && course.instructorId !== user.id) {
      throw new ForbiddenException('not_course_owner');
    }
  }

  private async requireOwnedCourse(courseId: string, user: AuthenticatedUser) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('course_not_found');
    this.assertOwner(course, user);
    return course;
  }

  private async requireOwnedSection(sectionId: string, user: AuthenticatedUser) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: { select: { instructorId: true } } },
    });
    if (!section) throw new NotFoundException('section_not_found');
    this.assertOwner(section.course, user);
    return section;
  }

  private async requireOwnedLesson(lessonId: string, user: AuthenticatedUser) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          select: {
            id: true,
            courseId: true,
            course: { select: { instructorId: true } },
          },
        },
      },
    });
    if (!lesson) throw new NotFoundException('lesson_not_found');
    this.assertOwner(lesson.section.course, user);
    return {
      courseId: lesson.section.courseId,
      sectionId: lesson.section.id,
      videoAssetId: lesson.videoAssetId,
    };
  }

  private async requireOwnedQuestion(
    questionId: string,
    user: AuthenticatedUser,
  ) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          select: {
            id: true,
            lesson: {
              select: {
                section: {
                  select: {
                    courseId: true,
                    course: { select: { instructorId: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!question) throw new NotFoundException('question_not_found');
    this.assertOwner(question.quiz.lesson.section.course, user);
    return {
      courseId: question.quiz.lesson.section.courseId,
      quizId: question.quiz.id,
    };
  }

  private async normalizeQuestionOrders(quizId: string) {
    const questions = await this.prisma.quizQuestion.findMany({
      where: { quizId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });
    await this.prisma.$transaction([
      ...questions.map((q, i) =>
        this.prisma.quizQuestion.update({
          where: { id: q.id },
          data: { order: 1000 + i },
        }),
      ),
      ...questions.map((q, i) =>
        this.prisma.quizQuestion.update({
          where: { id: q.id },
          data: { order: i },
        }),
      ),
    ]);
  }

  private assertSameSet(actual: string[], provided: string[]) {
    if (
      actual.length !== provided.length ||
      !actual.every((id) => provided.includes(id))
    ) {
      throw new BadRequestException('reorder_set_mismatch');
    }
  }

  private async normalizeSectionOrders(courseId: string) {
    const sections = await this.prisma.section.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });
    await this.prisma.$transaction([
      ...sections.map((s, i) =>
        this.prisma.section.update({
          where: { id: s.id },
          data: { order: 1000 + i },
        }),
      ),
      ...sections.map((s, i) =>
        this.prisma.section.update({ where: { id: s.id }, data: { order: i } }),
      ),
    ]);
  }

  private async normalizeLessonOrders(sectionId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });
    await this.prisma.$transaction([
      ...lessons.map((l, i) =>
        this.prisma.lesson.update({
          where: { id: l.id },
          data: { order: 1000 + i },
        }),
      ),
      ...lessons.map((l, i) =>
        this.prisma.lesson.update({ where: { id: l.id }, data: { order: i } }),
      ),
    ]);
  }

  /**
   * Edit-published rule (ТЗ п.7): a noticeable curriculum change on a live course
   * sends it back to review. No-op while the course is still a draft / in review.
   */
  private async flipPublishedToReview(courseId: string) {
    await this.prisma.course.updateMany({
      where: { id: courseId, status: 'PUBLISHED' },
      data: { status: 'PENDING_REVIEW' },
    });
  }

  private async recount(courseId: string) {
    const sections = await this.prisma.section.findMany({
      where: { courseId },
      include: { lessons: { select: { durationSeconds: true } } },
    });
    let totalLessons = 0;
    let totalSeconds = 0;
    for (const section of sections) {
      const count = section.lessons.length;
      const seconds = section.lessons.reduce(
        (acc, l) => acc + l.durationSeconds,
        0,
      );
      totalLessons += count;
      totalSeconds += seconds;
      await this.prisma.section.update({
        where: { id: section.id },
        data: { lessonsCount: count, durationMinutes: Math.round(seconds / 60) },
      });
    }
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        lessonsCount: totalLessons,
        durationMinutes: Math.round(totalSeconds / 60),
      },
    });
  }

  private async uniqueSlug(title: string, excludeId: string) {
    const base = this.slugify(title) || 'kurs';
    let slug = base;
    let n = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.prisma.course.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) return slug;
      n += 1;
      slug = `${base}-${n}`;
    }
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/['']/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  private shape(course: CourseWithCurriculum) {
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      status: course.status,
      thumbnailUrl: course.thumbnailUrl,
      categoryId: course.categoryId,
      level: course.level,
      language: course.language,
      priceUsdCents: course.priceUsdCents,
      discountUsdCents: course.discountUsdCents,
      description: course.description,
      longDescription: course.longDescription,
      learningOutcomes: course.learningOutcomes,
      requirements: course.requirements,
      durationMinutes: course.durationMinutes,
      lessonsCount: course.lessonsCount,
      sections: course.sections.map((section) => ({
        id: section.id,
        title: section.title,
        order: section.order,
        lessonsCount: section.lessonsCount,
        durationMinutes: section.durationMinutes,
        lessons: section.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: lesson.type,
          order: lesson.order,
          isPreview: lesson.isPreview,
          durationSeconds: lesson.durationSeconds,
          articleContent: lesson.articleContent,
          resources: lesson.resources,
          videoAssetId: lesson.videoAssetId,
          muxPlaybackId: lesson.muxPlaybackId,
          muxAssetStatus: lesson.muxAssetStatus,
          coding: lesson.codingExercise
            ? {
                language: lesson.codingExercise.language,
                entryFunction: lesson.codingExercise.entryFunction,
                starterCode: lesson.codingExercise.starterCode,
                solutionCode: lesson.codingExercise.solutionCode,
                tests: lesson.codingExercise.tests,
              }
            : null,
          quiz: lesson.quiz
            ? {
                id: lesson.quiz.id,
                passingScore: lesson.quiz.passingScore,
                attemptsAllowed: lesson.quiz.attemptsAllowed,
                questions: lesson.quiz.questions.map((q) => ({
                  id: q.id,
                  type: q.type,
                  text: q.text,
                  options: q.options,
                  correctAnswerIds: q.correctAnswerIds,
                  explanation: q.explanation,
                  order: q.order,
                })),
              }
            : null,
        })),
      })),
    };
  }
}
