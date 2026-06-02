"use client";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { categoriesKeys } from "@/lib/query-keys";

import { fetchCategories, fetchCategoryBySlug } from "./api";

function isNotFound(err: unknown): boolean {
  return err instanceof AxiosError && err.response?.status === 404;
}

export function useCategories() {
  return useQuery({
    queryKey: categoriesKeys.list(),
    queryFn: fetchCategories,
    staleTime: 10 * 60_000,
  });
}

export function useCategory(
  slug: string | null | undefined,
  page = 1,
  limit?: number,
) {
  return useQuery({
    queryKey: categoriesKeys.detail(slug ?? "", page, limit),
    queryFn: () => fetchCategoryBySlug(slug as string, page, limit),
    enabled: Boolean(slug),
    retry: (count, err) => !isNotFound(err) && count < 1,
  });
}
