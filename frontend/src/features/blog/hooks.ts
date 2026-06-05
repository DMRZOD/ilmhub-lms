"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { blogKeys } from "@/lib/query-keys";

import {
  createBlogComment,
  deleteBlogComment,
  fetchBlogComments,
} from "./api";

export function useBlogComments(slug: string) {
  return useQuery({
    queryKey: blogKeys.comments(slug),
    queryFn: () => fetchBlogComments(slug),
    staleTime: 30_000,
  });
}

export function useCreateBlogComment(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { body: string; parentId?: string }) =>
      createBlogComment(slug, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blogKeys.comments(slug) });
    },
    onError: () => toast.error("Izohni yuborib bo'lmadi"),
  });
}

export function useDeleteBlogComment(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBlogComment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blogKeys.comments(slug) });
      toast.success("Izoh o'chirildi");
    },
    onError: () => toast.error("O'chirib bo'lmadi"),
  });
}
