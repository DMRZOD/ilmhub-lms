import { api } from "@/lib/api-client";

import type { User } from "@/features/auth/types";

export type UpdateProfileInput = {
  name?: string;
  bio?: string;
  avatarUrl?: string;
};

export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  const { data } = await api.patch<User>("/users/me", input);
  return data;
}

export async function updateAvatar(avatarDataUrl: string): Promise<User> {
  const { data } = await api.put<User>("/users/me/avatar", { avatarDataUrl });
  return data;
}

export async function changePassword(input: {
  oldPassword: string;
  newPassword: string;
}): Promise<void> {
  await api.patch("/users/me/password", input);
}

export async function requestEmailChange(newEmail: string): Promise<void> {
  await api.post("/users/me/email-change", { newEmail });
}

export async function confirmEmailChange(token: string): Promise<void> {
  await api.get("/users/me/email-change/confirm", { params: { token } });
}

export async function deleteAccount(password: string): Promise<void> {
  await api.delete("/users/me", { data: { password } });
}

export type NotificationPreferences = {
  emailNewCourses: boolean;
  emailNewLessons: boolean;
  emailQaReplies: boolean;
  emailReviewReplies: boolean;
  emailWeeklyDigest: boolean;
  emailPromo: boolean;
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await api.get<NotificationPreferences>("/users/me/notification-preferences");
  return data;
}

export async function updateNotificationPreferences(
  input: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const { data } = await api.put<NotificationPreferences>(
    "/users/me/notification-preferences",
    input,
  );
  return data;
}
