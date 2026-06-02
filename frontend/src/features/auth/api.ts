import { api } from "@/lib/api-client";

import type { Role, User } from "./types";

export type AuthSession = { user: User; accessToken: string };

type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

async function persistSession(accessToken: string, refreshToken: string) {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken, refreshToken }),
  });
  if (!res.ok) throw new Error("Sessiyani saqlab bo'lmadi");
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  const { data } = await api.post<AuthResponse>("/auth/login", input);
  await persistSession(data.accessToken, data.refreshToken);
  return { user: data.user, accessToken: data.accessToken };
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<AuthSession> {
  const { data } = await api.post<AuthResponse>("/auth/register", input);
  await persistSession(data.accessToken, data.refreshToken);
  return { user: data.user, accessToken: data.accessToken };
}

export async function signOut(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export async function forgotPassword(input: { email: string }): Promise<void> {
  await api.post("/auth/forgot-password", input);
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<void> {
  await api.post("/auth/reset-password", {
    token: input.token,
    newPassword: input.password,
  });
}

export async function verifyEmail(input: { token: string }): Promise<void> {
  await api.get("/auth/verify-email", { params: { token: input.token } });
}

export async function resendVerification(input: {
  email: string;
}): Promise<void> {
  await api.post("/auth/resend-verification", input);
}
