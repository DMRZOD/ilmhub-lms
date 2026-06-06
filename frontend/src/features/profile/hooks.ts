"use client";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { profileKeys } from "@/lib/query-keys";

import { fetchPublicProfile } from "./api";

function isNotFound(err: unknown): boolean {
  return err instanceof AxiosError && err.response?.status === 404;
}

export function usePublicProfile(id: string | null | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(id ?? ""),
    queryFn: () => fetchPublicProfile(id as string),
    enabled: Boolean(id),
    retry: (count, err) => !isNotFound(err) && count < 1,
  });
}
