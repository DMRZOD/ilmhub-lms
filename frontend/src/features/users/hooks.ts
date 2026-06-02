"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { meQueryKey } from "@/features/auth/hooks";
import type { User } from "@/features/auth/types";

import {
  changePassword,
  confirmEmailChange,
  deleteAccount,
  getNotificationPreferences,
  requestEmailChange,
  updateAvatar,
  updateNotificationPreferences,
  updateProfile,
  type NotificationPreferences,
  type UpdateProfileInput,
} from "./api";

export const notifPrefsQueryKey = ["users", "notification-preferences"] as const;

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (user: User) => {
      qc.setQueryData(meQueryKey, user);
    },
  });
}

export function useUpdateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (avatarDataUrl: string) => updateAvatar(avatarDataUrl),
    onSuccess: (user: User) => {
      qc.setQueryData(meQueryKey, user);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: requestEmailChange,
  });
}

export function useConfirmEmailChange() {
  return useMutation({
    mutationFn: confirmEmailChange,
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      qc.setQueryData(meQueryKey, null);
      qc.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notifPrefsQueryKey,
    queryFn: getNotificationPreferences,
    staleTime: 60_000,
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<NotificationPreferences>) =>
      updateNotificationPreferences(input),
    onSuccess: (data) => {
      qc.setQueryData(notifPrefsQueryKey, data);
    },
  });
}
