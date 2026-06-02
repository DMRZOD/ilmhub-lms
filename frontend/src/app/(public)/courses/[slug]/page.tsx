import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseDetailContent } from "@/components/features/courses/details/course-detail-content";
import { JsonLd } from "@/components/seo/json-ld";
import { courseSchema, type CourseSchemaInput } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/site";
import { serverFetch } from "@/lib/server-api";

type RouteParams = { slug: string };

// ISR: the server-rendered shell (metadata + JSON-LD) is cached and revalidated
// hourly; the interactive body is still client-rendered via React Query.
export const revalidate = 3600;

type CourseMeta = CourseSchemaInput & {
  description?: string | null;
  thumbnailUrl?: string | null;
};

async function getCourse(slug: string): Promise<CourseMeta | null> {
  return serverFetch<CourseMeta>(`/courses/${encodeURIComponent(slug)}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Kurs — IlmHub" };

  const title = course.title;
  const description =
    course.subtitle || course.description || `${course.title} — IlmHub kursi`;
  const canonical = absoluteUrl(`kurslar/${slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      ...(course.thumbnailUrl ? { images: [{ url: course.thumbnailUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(course.thumbnailUrl ? { images: [course.thumbnailUrl] } : {}),
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  return (
    <>
      <JsonLd data={courseSchema(course)} />
      <CourseDetailContent slug={slug} />
    </>
  );
}
