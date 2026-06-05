import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryDetail } from "@/components/features/categories/category-detail";
import { absoluteUrl } from "@/lib/seo/site";
import { serverFetch } from "@/lib/server-api";

interface RouteParams {
  slug: string;
}

// ISR on the server-rendered shell (metadata).
export const revalidate = 3600;

interface CategoryResponse {
  category: { name: string; description?: string | null } | null;
}

async function getCategory(slug: string): Promise<CategoryResponse | null> {
  return serverFetch<CategoryResponse>(
    `/categories/${encodeURIComponent(slug)}`,
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategory(slug);
  if (!data?.category) return { title: "Kategoriya" };

  const { category } = data;
  const title = `${category.name} kurslari`;
  const description =
    category.description ||
    `${category.name} yo'nalishi bo'yicha IlmHub'dagi onlayn kurslar.`;
  const canonical = absoluteUrl(`kategoriyalar/${slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", title, description, url: canonical },
  };
}

export default async function KategoriyaDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const data = await getCategory(slug);
  if (!data?.category) notFound();

  return <CategoryDetail slug={slug} />;
}
