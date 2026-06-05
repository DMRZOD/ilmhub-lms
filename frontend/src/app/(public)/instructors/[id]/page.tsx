import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InstructorProfile } from "@/components/features/instructors/instructor-profile";
import { JsonLd } from "@/components/seo/json-ld";
import { personSchema, type PersonSchemaInput } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/site";
import { serverFetch } from "@/lib/server-api";

interface RouteParams {
  id: string;
}

// ISR on the server-rendered shell (metadata + JSON-LD).
export const revalidate = 3600;

async function getInstructor(id: string): Promise<PersonSchemaInput | null> {
  return serverFetch<PersonSchemaInput>(`/instructors/${encodeURIComponent(id)}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const instructor = await getInstructor(id);
  if (!instructor) return { title: "Ustoz" };

  const title = instructor.name;
  const description =
    instructor.bio || `${instructor.name} — IlmHub ustozi va uning kurslari`;
  const canonical = absoluteUrl(`ustozlar/${id}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonical,
      ...(instructor.avatarUrl ? { images: [{ url: instructor.avatarUrl }] } : {}),
    },
    twitter: {
      card: "summary",
      title,
      description,
      ...(instructor.avatarUrl ? { images: [instructor.avatarUrl] } : {}),
    },
  };
}

export default async function UstozProfilePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;
  const instructor = await getInstructor(id);
  if (!instructor) notFound();

  return (
    <>
      <JsonLd data={personSchema(instructor)} />
      <InstructorProfile id={id} />
    </>
  );
}
