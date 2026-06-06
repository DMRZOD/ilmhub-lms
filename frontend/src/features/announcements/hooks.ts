"use client";

import { useQuery } from "@tanstack/react-query";

import { announcementsKeys } from "@/lib/query-keys";

import { fetchCourseAnnouncements } from "./api";

export function useCourseAnnouncements(courseId: string, enabled = true) {
  return useQuery({
    queryKey: announcementsKeys.course(courseId),
    queryFn: () => fetchCourseAnnouncements(courseId),
    enabled: enabled && Boolean(courseId),
  });
}
