import { z } from "zod";

import { api } from "@/lib/api-client";

import {
  createDraftResponseSchema,
  myCoursesResponseSchema,
  uploadImageResponseSchema,
  wizardCourseSchema,
  type CodingLanguage,
  type CodingTest,
  type CourseStatus,
  type LessonType,
  type QuizOption,
  type QuizQuestionType,
  type Resource,
  type WizardLesson,
  type WizardSection,
} from "./schemas";

export type UpdateCoursePayload = Partial<{
  title: string;
  subtitle: string;
  categoryId: string;
  level: string;
  language: string;
  priceUsdCents: number;
  discountUsdCents: number;
  thumbnailUrl: string;
  description: string;
  longDescription: string;
  learningOutcomes: string[];
  requirements: string[];
}>;

export type UpdateLessonPayload = Partial<{
  title: string;
  description: string;
  type: LessonType;
  isPreview: boolean;
}>;

export async function createDraftCourse() {
  const { data } = await api.post("/courses/draft");
  return createDraftResponseSchema.parse(data);
}

export async function fetchMyCourses(status?: CourseStatus) {
  const { data } = await api.get("/me/courses", {
    params: status ? { status } : undefined,
  });
  return myCoursesResponseSchema.parse(data).items;
}

export async function fetchWizardCourse(id: string) {
  const { data } = await api.get(`/me/courses/${id}`);
  return wizardCourseSchema.parse(data);
}

export async function updateCourse(id: string, payload: UpdateCoursePayload) {
  const { data } = await api.patch(`/courses/${id}`, payload);
  return wizardCourseSchema.parse(data);
}

export async function deleteCourse(id: string) {
  await api.delete(`/courses/${id}`);
}

export async function addSection(courseId: string, title: string) {
  const { data } = await api.post(`/courses/${courseId}/sections`, { title });
  return data as WizardSection;
}

export async function updateSection(sectionId: string, title: string) {
  await api.patch(`/sections/${sectionId}`, { title });
}

export async function deleteSection(sectionId: string) {
  await api.delete(`/sections/${sectionId}`);
}

export async function reorderSections(courseId: string, orderedIds: string[]) {
  await api.patch(`/courses/${courseId}/sections/reorder`, { orderedIds });
}

export async function addLesson(
  sectionId: string,
  title: string,
  type: LessonType,
) {
  const { data } = await api.post(`/sections/${sectionId}/lessons`, {
    title,
    type,
  });
  return data as WizardLesson;
}

export async function updateLesson(
  lessonId: string,
  payload: UpdateLessonPayload,
) {
  await api.patch(`/lessons/${lessonId}`, payload);
}

export async function deleteLesson(lessonId: string) {
  await api.delete(`/lessons/${lessonId}`);
}

export async function reorderLessons(sectionId: string, orderedIds: string[]) {
  await api.patch(`/sections/${sectionId}/lessons/reorder`, { orderedIds });
}

export async function uploadCourseImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  // Do NOT set Content-Type manually: the browser must add the
  // `multipart/form-data; boundary=...` header itself, otherwise the boundary
  // is missing and the server (multer) can't parse the upload.
  const { data } = await api.post("/uploads/image", form);
  return uploadImageResponseSchema.parse(data);
}

// -------------------------------------------------------------- step 5 (video)
const videoUploadResponseSchema = z.object({
  uploadId: z.string(),
  url: z.string(),
});

export async function createVideoUpload(lessonId: string) {
  const { data } = await api.post(`/lessons/${lessonId}/video-upload`);
  return videoUploadResponseSchema.parse(data);
}

export type LessonContentPayload = Partial<{
  articleContent: string;
  resources: Resource[];
  isPreview: boolean;
  description: string;
}>;

export async function updateLessonContent(
  lessonId: string,
  payload: LessonContentPayload,
) {
  await api.patch(`/lessons/${lessonId}/content`, payload);
}

// ------------------------------------------------------------- step 6 (coding)
export type CodingPayload = {
  language: CodingLanguage;
  starterCode: string;
  solutionCode: string;
  tests: CodingTest[];
};

export async function upsertCoding(lessonId: string, payload: CodingPayload) {
  await api.patch(`/lessons/${lessonId}/coding`, payload);
}

// -------------------------------------------------------------- step 7 (quiz)
export async function upsertQuiz(
  lessonId: string,
  settings: { passingScore: number; attemptsAllowed: number },
) {
  await api.patch(`/lessons/${lessonId}/quiz`, settings);
}

export type QuizQuestionPayload = {
  type: QuizQuestionType;
  text: string;
  options?: QuizOption[];
  correctAnswerIds: string[];
  explanation?: string;
};

export async function addQuizQuestion(
  lessonId: string,
  payload: QuizQuestionPayload,
) {
  const { data } = await api.post(
    `/lessons/${lessonId}/quiz/questions`,
    payload,
  );
  return data as { id: string };
}

export async function updateQuizQuestion(
  questionId: string,
  payload: Partial<QuizQuestionPayload>,
) {
  await api.patch(`/quiz-questions/${questionId}`, payload);
}

export async function deleteQuizQuestion(questionId: string) {
  await api.delete(`/quiz-questions/${questionId}`);
}

export async function reorderQuizQuestions(
  lessonId: string,
  orderedIds: string[],
) {
  await api.patch(`/lessons/${lessonId}/quiz/questions/reorder`, {
    orderedIds,
  });
}

// ------------------------------------------------------------ step 8 (publish)
export async function submitForReview(courseId: string) {
  const { data } = await api.patch(`/courses/${courseId}/submit-for-review`);
  return wizardCourseSchema.parse(data);
}
