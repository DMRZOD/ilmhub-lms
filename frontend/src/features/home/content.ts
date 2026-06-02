"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/lib/api-client";
import { contentKeys } from "@/lib/query-keys";

export const homeContentSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
    primaryCtaLabel: z.string(),
    primaryCtaHref: z.string(),
    secondaryCtaLabel: z.string(),
    secondaryCtaHref: z.string(),
  }),
  stats: z.array(
    z.object({
      value: z.number(),
      suffix: z.string(),
      label: z.string(),
    }),
  ),
  testimonials: z.array(
    z.object({
      id: z.string(),
      studentName: z.string(),
      studentAvatar: z.string().nullable(),
      studentRole: z.string().nullable(),
      courseName: z.string().nullable(),
      rating: z.number(),
      text: z.string(),
    }),
  ),
  faqs: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
    }),
  ),
});

export type HomeContent = z.infer<typeof homeContentSchema>;

export async function fetchHomeContent(): Promise<HomeContent> {
  const { data } = await api.get("/content/home");
  return homeContentSchema.parse(data);
}

/** Public home-page content (hero/stats/testimonials/FAQ) managed via admin CMS. */
export function useHomeContent() {
  return useQuery({
    queryKey: contentKeys.home(),
    queryFn: fetchHomeContent,
    staleTime: 60_000,
  });
}
