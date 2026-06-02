"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { fetchMe } from "@/features/auth/api";
import { meQueryKey } from "@/features/auth/hooks";
import { dashboardPathForRole } from "@/features/auth/roles";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    if (!accessToken || !refreshToken) {
      router.replace("/login?error=oauth");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken }),
        });
        if (!res.ok) throw new Error("session-failed");
        if (cancelled) return;
        const user = await fetchMe();
        qc.setQueryData(meQueryKey, user);
        if (cancelled) return;
        router.replace(dashboardPathForRole(user.role));
      } catch {
        if (!cancelled) router.replace("/login?error=oauth");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams, qc]);

  return (
    <div className="flex flex-col items-center gap-sp-3 text-ilm-ink">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-t-14 font-semibold">Hisobingizga kiritilmoqda…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ilm-paper">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-sp-3 text-ilm-ink">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <AuthCallbackInner />
      </Suspense>
    </main>
  );
}
