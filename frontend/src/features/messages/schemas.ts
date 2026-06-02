import { z } from "zod";

const userRef = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

export const conversationSummarySchema = z.object({
  id: z.string(),
  otherUser: userRef,
  role: z.enum(["INSTRUCTOR", "STUDENT"]),
  lastMessageAt: z.string(),
  lastMessage: z
    .object({
      body: z.string(),
      senderId: z.string(),
      createdAt: z.string(),
    })
    .nullable(),
  unreadCount: z.number(),
});
export const conversationListSchema = z.array(conversationSummarySchema);
export type ConversationSummary = z.infer<typeof conversationSummarySchema>;

export const messageSchema = z.object({
  id: z.string(),
  body: z.string(),
  senderId: z.string(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});
export type ChatMessage = z.infer<typeof messageSchema>;

export const conversationThreadSchema = z.object({
  conversation: z.object({ id: z.string(), otherUser: userRef }),
  messages: z.object({
    items: z.array(messageSchema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  }),
});
export type ConversationThread = z.infer<typeof conversationThreadSchema>;

export const unreadCountSchema = z.object({ count: z.number() });
