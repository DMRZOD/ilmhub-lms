"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { messagesKeys } from "@/lib/query-keys";
import { useAuth } from "@/features/auth/hooks";

import {
  fetchConversation,
  fetchConversations,
  fetchUnreadCount,
  sendMessage,
  startConversation,
  startConversationWithInstructor,
} from "./api";
import type { ChatMessage, ConversationThread } from "./schemas";

export function useConversations() {
  return useQuery({
    queryKey: messagesKeys.conversations(),
    queryFn: fetchConversations,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useConversation(id: string | undefined, page = 1) {
  return useQuery({
    queryKey: messagesKeys.conversation(id ?? "", page),
    queryFn: () => fetchConversation(id as string, page),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useSendMessage(conversationId: string | undefined) {
  const qc = useQueryClient();
  const { data: me } = useAuth();
  return useMutation({
    mutationFn: (body: string) => sendMessage(conversationId as string, body),
    // Optimistically append to the open (page 1) thread so the bubble shows
    // instantly; roll back on error, reconcile with the server on settle.
    onMutate: async (body) => {
      if (!conversationId) return;
      const key = messagesKeys.conversation(conversationId, 1);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ConversationThread>(key);
      if (previous) {
        const optimistic: ChatMessage = {
          id: `temp-${Date.now()}`,
          body,
          senderId: me?.id ?? "me",
          readAt: null,
          createdAt: new Date().toISOString(),
        };
        qc.setQueryData<ConversationThread>(key, {
          ...previous,
          messages: {
            ...previous.messages,
            items: [...previous.messages.items, optimistic],
          },
        });
      }
      return { key, previous };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.previous) qc.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: messagesKeys.all });
    },
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, body }: { studentId: string; body?: string }) =>
      startConversation(studentId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagesKeys.conversations() });
    },
  });
}

export function useStartConversationWithInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      instructorId,
      body,
    }: {
      instructorId: string;
      body?: string;
    }) => startConversationWithInstructor(instructorId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagesKeys.conversations() });
    },
  });
}

export function useUnreadMessages() {
  return useQuery({
    queryKey: messagesKeys.unread(),
    queryFn: fetchUnreadCount,
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}
