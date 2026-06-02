import type { ReactNode } from "react";

import { RoleGate } from "@/components/auth/role-gate";
import { AdminSidebar } from "@/components/admin-shell/admin-sidebar";
import { AdminTopbar } from "@/components/admin-shell/admin-topbar";
import { NotificationStreamProvider } from "@/components/notification-stream-provider";

export default function AdminGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGate roles={["ADMIN"]}>
      <NotificationStreamProvider />
      <div className="flex min-h-screen bg-ilm-paper">
        <AdminSidebar className="hidden md:flex" />
        <div className="flex min-h-screen flex-1 flex-col">
          <AdminTopbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGate>
  );
}
