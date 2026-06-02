"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks";
import type { Role } from "@/features/auth/types";

type Props = {
  roles?: Role[];
  children: React.ReactNode;
};

function PageLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Loader2 className="h-8 w-8 animate-spin text-ilm-ink" />
    </div>
  );
}

function Forbidden() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-ilm-paper px-6">
      <div className="flex max-w-md flex-col items-center gap-sp-4 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-ilm-full bg-ilm-error-bg text-ilm-error">
          <ShieldAlert className="h-8 w-8" />
        </span>
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Sizda ruxsat yo&apos;q
        </h1>
        <p className="text-t-14 text-fg-2">
          Bu sahifaga kirish uchun ruxsatingiz yetarli emas.
        </p>
        <Button asChild size="lg" className="mt-sp-2">
          <Link href="/">Bosh sahifaga qaytish</Link>
        </Button>
      </div>
    </main>
  );
}

export function RoleGate({ roles, children }: Props) {
  const { data: user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      const from = pathname ?? "/";
      router.replace(`/login?from=${encodeURIComponent(from)}`);
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) return <PageLoader />;
  if (!user) return <PageLoader />;
  if (roles && !roles.includes(user.role)) return <Forbidden />;
  return <>{children}</>;
}
