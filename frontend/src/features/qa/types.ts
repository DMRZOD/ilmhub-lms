import { z } from "zod";

export const qaAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});
export type QaAuthor = z.infer<typeof qaAuthorSchema>;

export const answerSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  body: z.string(),
  isInstructorAnswer: z.boolean(),
  votesCount: z.number().int(),
  createdAt: z.string(),
  author: qaAuthorSchema,
});
export type Answer = z.infer<typeof answerSchema>;

export const questionListItemSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  lessonId: z.string().nullable(),
  title: z.string(),
  bodyPreview: z.string(),
  answersCount: z.number().int(),
  hasInstructorAnswer: z.boolean(),
  isResolved: z.boolean(),
  lastActivityAt: z.string(),
  createdAt: z.string(),
  author: qaAuthorSchema,
});
export type QuestionListItem = z.infer<typeof questionListItemSchema>;

export const questionDetailSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  lessonId: z.string().nullable(),
  title: z.string(),
  body: z.string(),
  answersCount: z.number().int(),
  hasInstructorAnswer: z.boolean(),
  isResolved: z.boolean(),
  lastActivityAt: z.string(),
  createdAt: z.string(),
  author: qaAuthorSchema,
  answers: z.array(answerSchema),
});
export type QuestionDetail = z.infer<typeof questionDetailSchema>;

export const paginationMetaSchema = z.object({
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export const questionListResponseSchema = z.object({
  items: z.array(questionListItemSchema),
  meta: paginationMetaSchema,
});
export type QuestionListResponse = z.infer<typeof questionListResponseSchema>;

export const resolveResponseSchema = z.object({
  id: z.string(),
  isResolved: z.boolean(),
});

export const voteResponseSchema = z.object({
  id: z.string(),
  votesCount: z.number().int(),
});

export type QaSort = "newest" | "popular" | "unresolved";
export type QaFilter = "all" | "unresolved" | "mine" | "instructor-answered";

export interface CreateQuestionInput {
  courseId: string;
  lessonId?: string;
  title: string;
  body: string;
}

export interface ListQuestionsParams {
  courseId: string;
  lessonId?: string;
  sort?: QaSort;
  mine?: boolean;
  instructorAnswered?: boolean;
  page?: number;
  limit?: number;
}
