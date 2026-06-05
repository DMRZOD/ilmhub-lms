import type { Metadata } from "next";
import Link from "next/link";

import { BlogCard } from "@/components/features/blog/blog-card";
import { BlogSearch } from "@/components/features/blog/blog-search";
import { Mascot } from "@/components/features/home/mascot";
import { cn } from "@/lib/utils";
import { serverFetch } from "@/lib/server-api";
import type { PublicBlogCategory, PublicBlogPosts } from "@/features/blog/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "IlmHub blogi — ta'lim, karyera va texnologiyalar haqida foydali maqolalar.",
};

const PAGE_SIZE = 12;

type SearchParams = { page?: string; category?: string; q?: string };

function chipClass(active: boolean): string {
  return cn(
    "rounded-ilm-full px-sp-4 py-sp-2 text-t-13 font-semibold transition-colors",
    active
      ? "bg-ilm-ink text-white"
      : "bg-ilm-surface text-ilm-muted-2 hover:text-ilm-ink",
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const category = sp.category ?? null;
  const q = sp.q?.trim() || null;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  if (category) params.set("categorySlug", category);
  if (q) params.set("q", q);

  const [posts, categories] = await Promise.all([
    serverFetch<PublicBlogPosts>(`/blog?${params.toString()}`),
    serverFetch<PublicBlogCategory[]>("/blog/categories"),
  ]);

  const items = posts?.items ?? [];
  const totalPages = posts?.meta.totalPages ?? 1;

  // Build a /blog URL preserving the active filters with optional overrides.
  function hrefWith(next: { category?: string | null; page?: number }): string {
    const u = new URLSearchParams();
    const cat = next.category !== undefined ? next.category : category;
    const pg = next.page ?? 1;
    if (cat) u.set("category", cat);
    if (q) u.set("q", q);
    if (pg > 1) u.set("page", String(pg));
    const s = u.toString();
    return s ? `/blog?${s}` : "/blog";
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-sp-8 px-sp-4 py-sp-8 sm:px-sp-6 lg:py-sp-12">
      <header className="flex flex-col gap-sp-2">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink sm:text-t-48">
          Blog
        </h1>
        <p className="max-w-2xl text-t-16 text-fg-2">
          Ta&apos;lim, karyera va texnologiyalar haqida foydali maqolalar.
        </p>
      </header>

      <div className="flex flex-col gap-sp-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-sp-2">
          <Link href={hrefWith({ category: null })} className={chipClass(!category)}>
            Barchasi
          </Link>
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              href={hrefWith({ category: c.slug })}
              className={chipClass(category === c.slug)}
            >
              {c.name}
            </Link>
          ))}
        </div>
        <BlogSearch initialQuery={q ?? ""} />
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
          <div className="grid place-items-center rounded-ilm-2xl bg-ilm-ink p-sp-5">
            <Mascot variant={3} size={140} className="opacity-90" />
          </div>
          <h3 className="text-t-24 font-bold text-ilm-ink">
            Maqola topilmadi
          </h3>
          <p className="max-w-md text-t-14 text-fg-2">
            Boshqa kategoriya yoki qidiruv so&apos;rovini sinab ko&apos;ring.
          </p>
        </div>
      ) : (
        <div className="grid gap-sp-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-sp-3 pt-sp-2"
          aria-label="Sahifalash"
        >
          {page > 1 ? (
            <Link
              href={hrefWith({ page: page - 1 })}
              className="rounded-ilm-md border border-ilm-border px-sp-4 py-sp-2 text-t-14 font-semibold text-ilm-ink transition-colors hover:bg-ilm-surface"
            >
              Oldingi
            </Link>
          ) : (
            <span className="rounded-ilm-md border border-ilm-border px-sp-4 py-sp-2 text-t-14 font-semibold text-fg-3 opacity-50">
              Oldingi
            </span>
          )}
          <span className="text-t-14 font-medium text-fg-2">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={hrefWith({ page: page + 1 })}
              className="rounded-ilm-md border border-ilm-border px-sp-4 py-sp-2 text-t-14 font-semibold text-ilm-ink transition-colors hover:bg-ilm-surface"
            >
              Keyingi
            </Link>
          ) : (
            <span className="rounded-ilm-md border border-ilm-border px-sp-4 py-sp-2 text-t-14 font-semibold text-fg-3 opacity-50">
              Keyingi
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
