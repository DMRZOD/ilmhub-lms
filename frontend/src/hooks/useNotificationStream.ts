"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { toast } from "sonner";

import { getAccessTokenFromCookie } from "@/lib/auth-cookies";
import { notificationsQueryKey } from "@/features/student/hooks";

export function useNotificationStream() {
  const qc = useQueryClient();

  useEffect(() => {
    const token = getAccessTokenFromCookie();
    if (!token) return;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const ctrl = new AbortController();

    fetchEventSource(`${apiUrl}/users/me/notifications/stream`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
      onmessage(ev) {
        try {
          const data = JSON.parse(ev.data) as {
            title?: string;
            body?: string;
          };
          if (data.title) {
            toast.info(data.title, {
              description: data.body,
              duration: 5000,
            });
          }
        } catch {
          // ignore malformed events
        }
        void qc.invalidateQueries({ queryKey: notificationsQueryKey });
      },
      onerror() {
        // fetchEventSource auto-reconnects on error; returning to suppress throw
        return;
      },
    }).catch(() => {
      // silence abort errors
    });

    return () => ctrl.abort();
  }, [qc]);
}
