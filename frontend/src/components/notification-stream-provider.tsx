"use client";

import { useNotificationStream } from "@/hooks/useNotificationStream";

export function NotificationStreamProvider() {
  useNotificationStream();
  return null;
}
