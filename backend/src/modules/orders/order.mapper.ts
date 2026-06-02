import type { Order, OrderItem } from '@prisma/client';

import {
  COURSE_CARD_INCLUDE,
  toCourseCard,
  type CourseWithRelations,
} from '../courses/course-card.mapper';

export const ORDER_DETAIL_INCLUDE = {
  items: {
    include: {
      course: { include: COURSE_CARD_INCLUDE },
    },
  },
} as const;

type OrderItemWithCourse = OrderItem & { course: CourseWithRelations };
export type OrderWithItems = Order & { items: OrderItemWithCourse[] };

export function toOrderDto(
  order: OrderWithItems,
  firstLessonId: string | null,
) {
  return {
    id: order.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    totalUsdCents: order.totalUsdCents,
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    createdAt: order.createdAt.toISOString(),
    firstLessonId,
    items: order.items.map((item) => ({
      courseId: item.courseId,
      priceUsdCents: item.priceUsdCents,
      course: toCourseCard(item.course),
    })),
  };
}

export type OrderDto = ReturnType<typeof toOrderDto>;
