import {
  COURSE_CARD_INCLUDE,
  toCourseCard,
  type CourseWithRelations,
} from '../courses/course-card.mapper';

export const ENROLLMENT_COURSE_INCLUDE = {
  course: { include: COURSE_CARD_INCLUDE },
} as const;

export interface EnrollmentRow {
  id: string;
  enrolledAt: Date;
  completedAt: Date | null;
  course: CourseWithRelations;
}

export function toEnrolledCourse(
  row: EnrollmentRow,
  progressPercent: number,
  lastAccessedAt: Date | null,
  reviewedByMe: boolean,
) {
  return {
    id: row.id,
    enrolledAt: row.enrolledAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    progressPercent,
    lastAccessedAt: lastAccessedAt ? lastAccessedAt.toISOString() : null,
    reviewedByMe,
    course: toCourseCard(row.course),
  };
}

export type EnrolledCourseDto = ReturnType<typeof toEnrolledCourse>;
