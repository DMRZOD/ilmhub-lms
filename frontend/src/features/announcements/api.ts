import { api } from "@/lib/api-client";

import type { CourseAnnouncement } from "./types";

export async function fetchCourseAnnouncements(
  courseId: string,
): Promise<CourseAnnouncement[]> {
  const { data } = await api.get<CourseAnnouncement[]>(
    `/courses/${encodeURIComponent(courseId)}/announcements`,
  );
  return data;
}
