import { z } from "zod";

export const COURSE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export const COURSE_LANGUAGES = ["UZ", "RU", "EN"] as const;
export const LESSON_TYPES = ["VIDEO", "ARTICLE", "QUIZ", "CODING"] as const;
export const COURSE_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED",
] as const;

// NOTE: pass inline literal arrays to z.enum (matching src/types/api.ts).
// Passing a named `as const` (readonly) array makes Zod 4 pick a different
// overload whose inferred type is degenerate.
export const lessonTypeSchema = z.enum(["VIDEO", "ARTICLE", "QUIZ", "CODING"]);
export type LessonType = z.infer<typeof lessonTypeSchema>;

export const courseStatusSchema = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED",
]);
export type CourseStatus = z.infer<typeof courseStatusSchema>;

export const courseLevelSchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);
export type CourseLevel = z.infer<typeof courseLevelSchema>;

export const courseLanguageSchema = z.enum(["UZ", "RU", "EN"]);
export type CourseLanguage = z.infer<typeof courseLanguageSchema>;

export const MUX_ASSET_STATUSES = [
  "NONE",
  "UPLOADING",
  "PROCESSING",
  "READY",
  "ERRORED",
] as const;
export const muxAssetStatusSchema = z.enum([
  "NONE",
  "UPLOADING",
  "PROCESSING",
  "READY",
  "ERRORED",
]);
export type MuxAssetStatus = z.infer<typeof muxAssetStatusSchema>;

export const CODING_LANGUAGES = [
  "JS",
  "TS",
  "PYTHON",
  "JAVA",
  "CPP",
  "GO",
] as const;

// Only JS/TS can be auto-graded, so these are the only authorable languages.
export const WIZARD_CODING_LANGUAGES = ["JS", "TS"] as const;
export const codingLanguageSchema = z.enum([
  "JS",
  "TS",
  "PYTHON",
  "JAVA",
  "CPP",
  "GO",
]);
export type CodingLanguage = z.infer<typeof codingLanguageSchema>;

export const QUIZ_QUESTION_TYPES = ["SINGLE", "MULTIPLE", "TEXT"] as const;
export const quizQuestionTypeSchema = z.enum(["SINGLE", "MULTIPLE", "TEXT"]);
export type QuizQuestionType = z.infer<typeof quizQuestionTypeSchema>;

export const resourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});
export type Resource = z.infer<typeof resourceSchema>;

export const codingTestSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  description: z.string().optional().nullable(),
  weight: z.number().int().min(1).max(10).default(1),
});
export type CodingTest = z.infer<typeof codingTestSchema>;

export const wizardCodingSchema = z.object({
  language: codingLanguageSchema,
  entryFunction: z.string().default(""),
  starterCode: z.string(),
  solutionCode: z.string(),
  tests: z.array(codingTestSchema).catch([]),
});
export type WizardCoding = z.infer<typeof wizardCodingSchema>;

export const quizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
});
export type QuizOption = z.infer<typeof quizOptionSchema>;

export const wizardQuizQuestionSchema = z.object({
  id: z.string(),
  type: quizQuestionTypeSchema,
  text: z.string(),
  options: z.array(quizOptionSchema).catch([]),
  correctAnswerIds: z.array(z.string()),
  explanation: z.string().nullable(),
  order: z.number(),
});
export type WizardQuizQuestion = z.infer<typeof wizardQuizQuestionSchema>;

export const wizardQuizSchema = z.object({
  id: z.string(),
  passingScore: z.number(),
  attemptsAllowed: z.number(),
  questions: z.array(wizardQuizQuestionSchema),
});
export type WizardQuiz = z.infer<typeof wizardQuizSchema>;

export const wizardLessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  type: lessonTypeSchema,
  order: z.number(),
  isPreview: z.boolean(),
  durationSeconds: z.number(),
  articleContent: z.string().nullable().default(null),
  resources: z.array(resourceSchema).catch([]),
  videoAssetId: z.string().nullable().default(null),
  muxPlaybackId: z.string().nullable().default(null),
  muxAssetStatus: muxAssetStatusSchema.default("NONE"),
  coding: wizardCodingSchema.nullable().default(null),
  quiz: wizardQuizSchema.nullable().default(null),
});
export type WizardLesson = z.infer<typeof wizardLessonSchema>;

export const wizardSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  lessonsCount: z.number(),
  durationMinutes: z.number(),
  lessons: z.array(wizardLessonSchema),
});
export type WizardSection = z.infer<typeof wizardSectionSchema>;

export const wizardCourseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  status: courseStatusSchema,
  thumbnailUrl: z.string().nullable(),
  categoryId: z.string(),
  level: courseLevelSchema,
  language: courseLanguageSchema,
  priceUsdCents: z.number(),
  discountUsdCents: z.number().nullable(),
  description: z.string(),
  longDescription: z.string().nullable(),
  learningOutcomes: z.array(z.string()),
  requirements: z.array(z.string()),
  durationMinutes: z.number(),
  lessonsCount: z.number(),
  sections: z.array(wizardSectionSchema),
});
export type WizardCourse = z.infer<typeof wizardCourseSchema>;

export const myCourseListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  status: courseStatusSchema,
  thumbnailUrl: z.string().nullable(),
  studentsCount: z.number(),
  lessonsCount: z.number(),
  durationMinutes: z.number(),
  priceUsdCents: z.number(),
  updatedAt: z.string(),
});
export type MyCourseListItem = z.infer<typeof myCourseListItemSchema>;

export const myCoursesResponseSchema = z.object({
  items: z.array(myCourseListItemSchema),
});

export const createDraftResponseSchema = z.object({ id: z.string() });
export const uploadImageResponseSchema = z.object({ url: z.string() });

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  VIDEO: "Video",
  ARTICLE: "Maqola",
  QUIZ: "Test",
  CODING: "Kod mashqi",
};

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  DRAFT: "Qoralama",
  PENDING_REVIEW: "Ko'rib chiqilmoqda",
  PUBLISHED: "Chop etilgan",
  REJECTED: "Rad etilgan",
  ARCHIVED: "Arxivlangan",
};

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: "Boshlang'ich",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Yuqori",
};

export const COURSE_LANGUAGE_LABELS: Record<CourseLanguage, string> = {
  UZ: "O'zbekcha",
  RU: "Ruscha",
  EN: "Inglizcha",
};

export const CODING_LANGUAGE_LABELS: Record<CodingLanguage, string> = {
  JS: "JavaScript",
  TS: "TypeScript",
  PYTHON: "Python",
  JAVA: "Java",
  CPP: "C++",
  GO: "Go",
};

// Monaco language identifiers for syntax highlighting.
export const CODING_LANGUAGE_MONACO: Record<CodingLanguage, string> = {
  JS: "javascript",
  TS: "typescript",
  PYTHON: "python",
  JAVA: "java",
  CPP: "cpp",
  GO: "go",
};

export const QUIZ_QUESTION_TYPE_LABELS: Record<QuizQuestionType, string> = {
  SINGLE: "Bitta to'g'ri javob",
  MULTIPLE: "Bir nechta to'g'ri javob",
  TEXT: "Matnli javob",
};
