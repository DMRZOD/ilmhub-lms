import Image from "next/image";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatShortDate, initialsOf } from "@/lib/format";
import type { PublicBlogListItem } from "@/features/blog/types";

export function BlogCard({ post }: { post: PublicBlogListItem }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block"
      aria-label={post.title}
    >
      <Card
        hoverable
        padding="none"
        className="flex h-full flex-col overflow-hidden"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-ilm-surface">
          {post.coverImageUrl && (
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-slow ease-ilm-out group-hover:scale-[1.03]"
            />
          )}
          {post.category && (
            <div className="absolute left-sp-3 top-sp-3">
              <Badge tone="neutral" className="bg-white/95">
                {post.category.name}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-sp-3 p-sp-5">
          <h3 className="line-clamp-2 text-t-18 font-bold leading-snug text-ilm-ink">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="line-clamp-2 text-t-14 text-fg-2">{post.excerpt}</p>
          )}
          <div className="mt-auto flex items-center gap-sp-2 pt-sp-2">
            <Avatar
              size="sm"
              src={post.author.avatarUrl ?? undefined}
              alt={post.author.name}
              initials={initialsOf(post.author.name)}
            />
            <span className="truncate text-t-12 text-fg-2">
              {post.author.name}
            </span>
            {post.publishedAt && (
              <span className="ml-auto shrink-0 text-t-12 text-fg-3">
                {formatShortDate(post.publishedAt)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
