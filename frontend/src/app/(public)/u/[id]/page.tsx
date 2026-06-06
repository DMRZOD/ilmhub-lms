import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProfileView } from "@/components/features/profile/public-profile";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { serverFetch } from "@/lib/server-api";

interface RouteParams {
  id: string;
}

type ProfileMeta = {
  name: string;
  bio: string | null;
  avatarUrl: string | null;
};

// ISR on the server-rendered shell (metadata + JSON-LD).
export const revalidate = 3600;

async function getProfileMeta(id: string): Promise<ProfileMeta | null> {
  return serverFetch<ProfileMeta>(`/users/${encodeURIComponent(id)}/profile`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfileMeta(id);
  if (!profile) return { title: "Profil" };

  const title = profile.name;
  const description =
    profile.bio ||
    `${profile.name} — IlmHub'dagi o'quvchi profili: kurslar va sertifikatlar`;
  const canonical = absoluteUrl(`u/${id}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonical,
      ...(profile.avatarUrl ? { images: [{ url: profile.avatarUrl }] } : {}),
    },
    twitter: {
      card: "summary",
      title,
      description,
      ...(profile.avatarUrl ? { images: [profile.avatarUrl] } : {}),
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;
  const profile = await getProfileMeta(id);
  if (!profile) notFound();

  const personSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: absoluteUrl(`u/${id}`),
    memberOf: { "@type": "Organization", name: SITE_NAME, sameAs: SITE_URL },
  };
  if (profile.bio) personSchema.description = profile.bio;
  if (profile.avatarUrl) personSchema.image = profile.avatarUrl;

  return (
    <>
      <JsonLd data={personSchema} />
      <PublicProfileView id={id} />
    </>
  );
}
