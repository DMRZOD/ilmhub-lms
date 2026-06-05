// Public blog payload shapes (what the public /blog endpoints return). These
// intentionally omit admin-only fields like status/createdAt/updatedAt.

export type PublicBlogAuthor = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type PublicBlogCategoryRef = {
  id: string;
  name: string;
  slug: string;
} | null;

export type PublicBlogListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  tags: string[];
  publishedAt: string | null;
  author: PublicBlogAuthor;
  category: PublicBlogCategoryRef;
};

export type PublicBlogPosts = {
  items: PublicBlogListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type PublicBlogPost = PublicBlogListItem & { content: string };

export type PublicBlogCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
};
