import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

import { AuthBrandPanel } from "@/features/auth/components/AuthBrandPanel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] bg-ilm-paper">
      <section className="relative flex flex-col px-6 py-8 lg:px-12 lg:py-12">
        <Link href="/" aria-label="IlmHub bosh sahifa" className="shrink-0">
          <Image
            src="/logo-black.svg"
            alt="IlmHub"
            width={128}
            height={31}
            priority
            className="h-7 w-auto md:h-6"
          />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[480px]">{children}</div>
        </div>
      </section>
      <AuthBrandPanel className="hidden lg:flex" />
    </div>
  );
}
