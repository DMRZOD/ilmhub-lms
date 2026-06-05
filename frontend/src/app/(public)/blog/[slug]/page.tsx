import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BlogComments } from "@/components/features/blog/blog-comments";
import { JsonLd } from "@/components/seo/json-ld";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatShortDate, initialsOf } from "@/lib/format";
import { absoluteUrl } from "@/lib/seo/site";
import { serverFetch } from "@/lib/server-api";
import type { PublicBlogPost } from "@/features/blog/types";

export const revalidate = 3600;

type RouteParams = { slug: string };

function getPost(slug: string): Promise<PublicBlogPost | null> {
  return serverFetch<PublicBlogPost>(`/blog/${encodeURIComponent(slug)}`);
}

function readingMinutes(content: string): number {
  const words = content
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Blog" };

  const title = post.title;
  const description = post.excerpt || `${post.title} — IlmHub blogi`;
  const canonical = absoluteUrl(`blog/${slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.coverImageUrl ? { images: [post.coverImageUrl] } : {}),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.coverImageUrl ? { image: post.coverImageUrl } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Organization", name: "IlmHub" },
    mainEntityOfPage: absoluteUrl(`blog/${post.slug}`),
  };

  // Admin posts are Tiptap HTML; seeded/plain posts are paragraphs split by
  // blank lines. Render HTML as-is (trusted admin content), otherwise wrap
  // paragraphs so the article reads correctly either way.
  const looksHtml = /<[a-z][\s\S]*>/i.test(post.content);
  const proseClass = "ilm-prose mt-sp-8 text-t-16 leading-relaxed text-fg-1";

  return (
    <article className="mx-auto w-full max-w-3xl px-sp-4 py-sp-8 sm:px-sp-6 lg:py-sp-12">
      <JsonLd data={jsonLd} />

      <div className="flex flex-col gap-sp-4">
        <Link
          href="/blog"
          className="inline-flex w-fit items-center gap-sp-1 text-t-13 font-semibold text-fg-3 transition-colors hover:text-ilm-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Blogga qaytish
        </Link>

        <div className="flex flex-wrap items-center gap-sp-2 text-t-13 text-fg-3">
          {post.category && <Badge tone="neutral">{post.category.name}</Badge>}
          {post.publishedAt && <span>{formatShortDate(post.publishedAt)}</span>}
          <span>· {readingMinutes(post.content)} daq o&apos;qish</span>
        </div>

        <h1 className="text-t-32 font-extrabold leading-tight tracking-ilm-tight text-ilm-ink sm:text-t-48">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-t-18 leading-relaxed text-fg-2">{post.excerpt}</p>
        )}

        <div className="flex items-center gap-sp-2">
          <Avatar
            size="sm"
            ink
            src={post.author.avatarUrl ?? undefined}
            alt={post.author.name}
            initials={initialsOf(post.author.name)}
          />
          <span className="text-t-14 font-medium text-ilm-ink">
            {post.author.name}
          </span>
        </div>
      </div>

      {post.coverImageUrl && (
        <div className="relative mt-sp-6 aspect-[16/9] w-full overflow-hidden rounded-ilm-2xl bg-ilm-surface">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {looksHtml ? (
        <div
          className={proseClass}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      ) : (
        <div className={proseClass}>
          {post.content
            .split(/\n{2,}/)
            .map((para, i) => para.trim() && <p key={i}>{para}</p>)}
        </div>
      )}

      {post.tags.length > 0 && (
        <div className="mt-sp-8 flex flex-wrap gap-sp-2">
          {post.tags.map((tag) => (
            <Badge key={tag} tone="neutral" className="bg-ilm-surface">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <BlogComments slug={post.slug} />
    </article>
  );
}
