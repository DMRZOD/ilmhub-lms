import { api } from "@/lib/api-client";

import {
  blogCommentSchema,
  blogCommentsSchema,
  type BlogComment,
} from "./schemas";

export async function fetchBlogComments(slug: string): Promise<BlogComment[]> {
  const { data } = await api.get(
    `/blog/${encodeURIComponent(slug)}/comments`,
  );
  return blogCommentsSchema.parse(data);
}

export async function createBlogComment(
  slug: string,
  body: { body: string; parentId?: string },
): Promise<BlogComment> {
  const { data } = await api.post(
    `/blog/${encodeURIComponent(slug)}/comments`,
    body,
  );
  return blogCommentSchema.parse(data);
}

export async function deleteBlogComment(id: string): Promise<void> {
  await api.delete(`/blog/comments/${encodeURIComponent(id)}`);
}
