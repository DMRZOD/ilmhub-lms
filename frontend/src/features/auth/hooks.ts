"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchMe, signIn, signOut, signUp } from "./api";
import type { User } from "./types";

export const meQueryKey = ["me"] as const;

export function useAuth() {
  return useQuery<User | null>({
    queryKey: meQueryKey,
    queryFn: async () => {
      try {
        return await fetchMe();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      qc.setQueryData(meQueryKey, data.user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      qc.setQueryData(meQueryKey, data.user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      qc.setQueryData(meQueryKey, null);
      qc.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}
