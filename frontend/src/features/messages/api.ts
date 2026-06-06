import { api } from "@/lib/api-client";

import {
  conversationListSchema,
  conversationThreadSchema,
  messageSchema,
  unreadCountSchema,
  type ChatMessage,
  type ConversationSummary,
  type ConversationThread,
} from "./schemas";

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const { data } = await api.get("/messages/conversations");
  return conversationListSchema.parse(data);
}

export async function fetchConversation(
  id: string,
  page = 1,
): Promise<ConversationThread> {
  const { data } = await api.get(`/messages/conversations/${id}`, {
    params: { page },
  });
  return conversationThreadSchema.parse(data);
}

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<ChatMessage> {
  const { data } = await api.post(
    `/messages/conversations/${conversationId}/messages`,
    { body },
  );
  return messageSchema.parse(data);
}

export async function startConversation(
  studentId: string,
  body?: string,
): Promise<{ id: string }> {
  const { data } = await api.post("/messages/conversations", {
    studentId,
    body,
  });
  return data as { id: string };
}

export async function startConversationWithInstructor(
  instructorId: string,
  body?: string,
): Promise<{ id: string }> {
  const { data } = await api.post("/messages/conversations/with-instructor", {
    instructorId,
    body,
  });
  return data as { id: string };
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get("/messages/unread-count");
  return unreadCountSchema.parse(data).count;
}
