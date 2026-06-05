import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo/site";
import { serverFetch } from "@/lib/server-api";

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

const staticRoutes: { path: string; priority: number; changeFrequency: ChangeFrequency }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "kurslar", priority: 0.9, changeFrequency: "weekly" },
  { path: "kategoriyalar", priority: 0.8, changeFrequency: "weekly" },
  { path: "ustozlar", priority: 0.8, changeFrequency: "weekly" },
  { path: "blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "biz-haqimizda", priority: 0.6, changeFrequency: "monthly" },
  { path: "aloqa", priority: 0.6, changeFrequency: "monthly" },
  { path: "maxfiylik", priority: 0.3, changeFrequency: "yearly" },
  { path: "foydalanish-shartlari", priority: 0.3, changeFrequency: "yearly" },
];

interface Paginated<T> {
  items: T[];
  meta: { totalPages: number };
}
interface CourseItem {
  slug: string;
  publishedAt: string | null;
}
interface CategoryItem {
  slug: string;
  updatedAt?: string | null;
}
interface InstructorItem {
  id: string;
}
interface BlogItem {
  slug: string;
  publishedAt: string | null;
}

// Safety cap so a large catalogue can't make sitemap generation run away.
const MAX_PAGES = 50;
const PAGE_SIZE = 100; // backend caps `limit` at 100

/** Walk all pages of a paginated public list endpoint. */
async function fetchAllPages<T>(basePath: string): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const sep = basePath.includes("?") ? "&" : "?";
    const res = await serverFetch<Paginated<T>>(
      `${basePath}${sep}page=${page}&limit=${PAGE_SIZE}`,
    );
    if (!res?.items?.length) break;
    out.push(...res.items);
    if (page >= (res.meta?.totalPages ?? page)) break;
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = staticRoutes.map(
    ({ path, priority, changeFrequency }) => ({
      url: path ? `${SITE_URL}/${path}` : SITE_URL,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  // Pull dynamic entries from the public API. On any failure (e.g. backend down
  // at build time) fetchAllPages/serverFetch yield empty results, so the
  // sitemap still builds with the static routes.
  const [courses, instructors, categories, blogPosts] = await Promise.all([
    fetchAllPages<CourseItem>("/courses"),
    fetchAllPages<InstructorItem>("/instructors"),
    serverFetch<CategoryItem[]>("/categories"),
    fetchAllPages<BlogItem>("/blog"),
  ]);

  const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${SITE_URL}/kurslar/${c.slug}`,
    lastModified: c.publishedAt ? new Date(c.publishedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = (categories ?? []).map((cat) => ({
    url: `${SITE_URL}/kategoriyalar/${cat.slug}`,
    lastModified: cat.updatedAt ? new Date(cat.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const instructorEntries: MetadataRoute.Sitemap = instructors.map((i) => ({
    url: `${SITE_URL}/ustozlar/${i.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...base,
    ...courseEntries,
    ...categoryEntries,
    ...instructorEntries,
    ...blogEntries,
  ];
}
