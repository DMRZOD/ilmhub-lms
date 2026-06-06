"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchEventSource,
  EventStreamContentType,
} from "@microsoft/fetch-event-source";
import { toast } from "sonner";

import { getAccessTokenFromCookie } from "@/lib/auth-cookies";
import { announcementsKeys, messagesKeys } from "@/lib/query-keys";
import { notificationsQueryKey } from "@/features/student/hooks";

// Thrown for non-retriable failures (e.g. expired token) so the stream stops
// reconnecting instead of hammering the backend once a second.
class FatalStreamError extends Error {}

const MAX_RETRY_MS = 30_000;

export function useNotificationStream() {
  const qc = useQueryClient();

  useEffect(() => {
    const token = getAccessTokenFromCookie();
    if (!token) return;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const ctrl = new AbortController();
    let retries = 0;

    fetchEventSource(`${apiUrl}/users/me/notifications/stream`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
      // Hold one stable connection even when the tab is hidden; otherwise the
      // lib closes on blur and reopens on focus, adding needless reconnects.
      openWhenHidden: true,
      async onopen(res) {
        if (
          res.ok &&
          res.headers.get("content-type")?.startsWith(EventStreamContentType)
        ) {
          retries = 0; // connected cleanly — reset backoff
          return;
        }
        // Bad/expired token: stop. The next page load (with a refreshed
        // cookie) starts a fresh stream — no point retrying with this one.
        if (res.status === 401 || res.status === 403) {
          throw new FatalStreamError(`auth ${res.status}`);
        }
        // 429 / 5xx / wrong content-type: retriable, fall through to onerror.
        throw new Error(`stream open failed: ${res.status}`);
      },
      onmessage(ev) {
        let type: string | undefined;
        try {
          const data = JSON.parse(ev.data) as {
            type?: string;
            title?: string;
            body?: string;
          };
          type = data.type;
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
        // Live-refresh the feature views the event touches, so DMs and course
        // announcements appear instantly instead of waiting on their polling.
        if (type === "NEW_MESSAGE") {
          void qc.invalidateQueries({ queryKey: messagesKeys.all });
        } else if (type === "ANNOUNCEMENT") {
          void qc.invalidateQueries({ queryKey: announcementsKeys.all });
        }
      },
      onerror(err) {
        // Fatal: rethrow so fetchEventSource gives up reconnecting.
        if (err instanceof FatalStreamError) throw err;
        // Otherwise reconnect with exponential backoff + jitter so a flaky or
        // throttled backend is never hit faster than every ~1s and backs off
        // up to MAX_RETRY_MS.
        retries += 1;
        const ceiling = Math.min(MAX_RETRY_MS, 1000 * 2 ** retries);
        return ceiling / 2 + Math.random() * (ceiling / 2);
      },
    }).catch(() => {
      // silence abort / fatal errors
    });

    return () => ctrl.abort();
  }, [qc]);
}
