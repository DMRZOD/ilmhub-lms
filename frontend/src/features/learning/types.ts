export type LessonType = "VIDEO" | "ARTICLE" | "QUIZ" | "CODING";
export type MuxPlaybackPolicy = "PUBLIC" | "SIGNED";

export interface LessonResource {
  name: string;
  url: string;
  size?: string | null;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  order: number;
  type: LessonType;
  durationSeconds: number;
  isPreview: boolean;
  completed: boolean;
  locked: boolean;
}

export interface CurriculumSection {
  id: string;
  title: string;
  order: number;
  lessons: CurriculumLesson[];
}

export interface LessonCourseSummary {
  id: string;
  slug: string;
  title: string;
  lessonsCount: number;
  sections: CurriculumSection[];
  progressPercent: number;
  completedCount: number;
  totalLessons: number;
}

export interface LessonMyProgress {
  lastPositionSeconds: number;
  completed: boolean;
  completedAt: string | null;
}

export interface LessonDetail {
  id: string;
  title: string;
  description: string | null;
  order: number;
  type: LessonType;
  durationSeconds: number;
  isPreview: boolean;
  muxPlaybackId: string | null;
  muxPlaybackPolicy: MuxPlaybackPolicy;
  articleContent: string | null;
  resources: LessonResource[];
  section: { id: string; title: string; order: number };
  course: LessonCourseSummary;
  myProgress: LessonMyProgress;
  navigation: { prevLessonId: string | null; nextLessonId: string | null };
  enrolled: boolean;
}

export interface PlaybackTokenResponse {
  playbackId: string;
  policy: MuxPlaybackPolicy;
  token: string | null;
  expiresAt: number | null;
}

export interface ProgressDto {
  positionSeconds: number;
  completed?: boolean;
}
