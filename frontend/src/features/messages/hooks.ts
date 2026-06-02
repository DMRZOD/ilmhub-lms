"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { messagesKeys } from "@/lib/query-keys";

import {
  fetchConversation,
  fetchConversations,
  fetchUnreadCount,
  sendMessage,
  startConversation,
} from "./api";

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
  return useMutation({
    mutationFn: (body: string) =>
      sendMessage(conversationId as string, body),
    onSuccess: () => {
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

export function useUnreadMessages() {
  return useQuery({
    queryKey: messagesKeys.unread(),
    queryFn: fetchUnreadCount,
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}
