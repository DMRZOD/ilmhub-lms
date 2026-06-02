import { RoleGate } from "@/components/auth/role-gate";
import { InstructorSidebar } from "@/components/instructor-shell/instructor-sidebar";
import { InstructorTopbar } from "@/components/instructor-shell/instructor-topbar";
import { NotificationStreamProvider } from "@/components/notification-stream-provider";

export default function InstructorGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate roles={["INSTRUCTOR", "ADMIN"]}>
      <NotificationStreamProvider />
      <div className="flex min-h-screen bg-ilm-paper">
        <InstructorSidebar className="hidden md:flex" />
        <div className="flex min-h-screen flex-1 flex-col">
          <InstructorTopbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGate>
  );
}
