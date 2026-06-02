import type { Course, Category, User } from '@prisma/client';

export type CourseWithRelations = Course & {
  instructor: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  category: Pick<Category, 'id' | 'slug' | 'name' | 'iconName'>;
};

export const COURSE_CARD_INCLUDE = {
  instructor: { select: { id: true, name: true, avatarUrl: true } },
  category: { select: { id: true, slug: true, name: true, iconName: true } },
} as const;

export function toCourseCard(course: CourseWithRelations) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    thumbnailUrl: course.thumbnailUrl,
    level: course.level,
    language: course.language,
    priceUsdCents: course.priceUsdCents,
    discountUsdCents: course.discountUsdCents,
    durationMinutes: course.durationMinutes,
    lessonsCount: course.lessonsCount,
    studentsCount: course.studentsCount,
    ratingAvg: Number(course.ratingAvg),
    ratingCount: course.ratingCount,
    publishedAt: course.publishedAt,
    instructor: course.instructor,
    category: course.category,
  };
}
