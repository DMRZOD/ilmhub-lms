import { z } from "zod";

const commentUser = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

const commentBase = z.object({
  id: z.string(),
  body: z.string(),
  createdAt: z.string(),
  user: commentUser,
});

export const blogCommentSchema = commentBase.extend({
  replies: z.array(commentBase),
});
export const blogCommentsSchema = z.array(blogCommentSchema);

export type BlogComment = z.infer<typeof blogCommentSchema>;
export type BlogCommentReply = z.infer<typeof commentBase>;
