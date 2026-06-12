import { BadRequestException, ConflictException } from '@nestjs/common';

import { AdminCoursesService } from './admin-courses.service';
import { createMockPrisma } from '../../test-utils/mocks';

/** A course shape that satisfies every buildPublishChecklist rule. */
function completeChecklistCourse(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Web dasturlash',
    thumbnailUrl: 'https://cdn/thumb.png',
    description: 'Tavsif',
    lessonsCount: 3,
    sections: [
      {
        lessons: [
          { type: 'VIDEO', muxAssetStatus: 'READY', articleContent: null, quiz: null, codingExercise: null },
          { type: 'QUIZ', muxAssetStatus: 'NONE', articleContent: null, quiz: { questions: [{ id: 'q1' }] }, codingExercise: null },
          { type: 'CODING', muxAssetStatus: 'NONE', articleContent: null, quiz: null, codingExercise: { tests: [{ input: '[]', expectedOutput: '0' }] } },
        ],
      },
    ],
    ...overrides,
  };
}

/** A fully-shaped course so the trailing detail() call doesn't blow up. */
function detailCourse() {
  const now = new Date('2026-01-01T00:00:00Z');
  return {
    id: 'c1',
    slug: 'web-html-css',
    title: 'Web dasturlash',
    subtitle: '',
    description: 'Tavsif',
    longDescription: '',
    thumbnailUrl: 'https://cdn/thumb.png',
    previewVideoUrl: null,
    level: 'BEGINNER',
    language: 'UZ',
    priceUsdCents: 0,
    discountUsdCents: null,
    durationMinutes: 0,
    lessonsCount: 3,
    studentsCount: 0,
    ratingAvg: 0,
    ratingCount: 0,
    status: 'PUBLISHED',
    rejectionReason: null,
    learningOutcomes: [],
    requirements: [],
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    instructor: { id: 'i1', name: 'Aziz', email: 'a@x.uz', avatarUrl: null },
    category: { id: 'cat1', name: 'Programming', slug: 'programming' },
    sections: [],
  };
}

describe('AdminCoursesService.approve (unit)', () => {
  let prisma: any;
  let email: any;
  let audit: any;
  let notif: any;
  let service: AdminCoursesService;

  beforeEach(() => {
    prisma = createMockPrisma();
    email = { sendCourseApprovedEmail: jest.fn() };
    audit = { log: jest.fn(), listForTarget: jest.fn().mockResolvedValue([]) };
    notif = { createAndNotify: jest.fn() };
    service = new AdminCoursesService(prisma, email, audit, notif);
  });

  const pendingCourse = {
    id: 'c1',
    title: 'Web dasturlash',
    status: 'PENDING_REVIEW',
    instructorId: 'i1',
    publishedAt: null,
    instructor: { email: 'a@x.uz', name: 'Aziz' },
  };

  it('rejects publishing a course with a CODING lesson that has no exercise', async () => {
    prisma.course.findUnique.mockResolvedValue(pendingCourse); // requireCourse
    prisma.course.findUniqueOrThrow.mockResolvedValue(
      completeChecklistCourse({
        sections: [
          {
            lessons: [
              { type: 'VIDEO', muxAssetStatus: 'READY', articleContent: null, quiz: null, codingExercise: null },
              { type: 'VIDEO', muxAssetStatus: 'READY', articleContent: null, quiz: null, codingExercise: null },
              { type: 'CODING', muxAssetStatus: 'NONE', articleContent: null, quiz: null, codingExercise: null },
            ],
          },
        ],
      }),
    );

    await expect(service.approve('c1', 'admin1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    try {
      await service.approve('c1', 'admin1');
    } catch (e: any) {
      expect(e.getResponse()).toEqual({
        error: 'incomplete_course',
        missing: ['codingReady'],
      });
    }
    expect(prisma.course.update).not.toHaveBeenCalled();
    expect(notif.createAndNotify).not.toHaveBeenCalled();
  });

  it('publishes a complete course (guard does not false-block)', async () => {
    prisma.course.findUnique
      .mockResolvedValueOnce(pendingCourse) // requireCourse
      .mockResolvedValueOnce(detailCourse()); // trailing detail()
    prisma.course.findUniqueOrThrow.mockResolvedValue(completeChecklistCourse());
    prisma.course.update.mockResolvedValue(detailCourse());

    await service.approve('c1', 'admin1');

    expect(prisma.course.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'c1' },
        data: expect.objectContaining({ status: 'PUBLISHED' }),
      }),
    );
    expect(notif.createAndNotify).toHaveBeenCalledTimes(1);
    expect(email.sendCourseApprovedEmail).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictException when the course is already published', async () => {
    prisma.course.findUnique.mockResolvedValue({
      ...pendingCourse,
      status: 'PUBLISHED',
    });

    await expect(service.approve('c1', 'admin1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.course.findUniqueOrThrow).not.toHaveBeenCalled();
    expect(prisma.course.update).not.toHaveBeenCalled();
  });
});
