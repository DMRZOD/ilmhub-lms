import { RoleGate } from "@/components/auth/role-gate";
import { StudentSidebar } from "@/components/student-shell/student-sidebar";
import { StudentTopbar } from "@/components/student-shell/student-topbar";
import { NotificationStreamProvider } from "@/components/notification-stream-provider";

export default function StudentGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate roles={["STUDENT", "INSTRUCTOR", "ADMIN"]}>
      <NotificationStreamProvider />
      <div className="flex min-h-screen bg-ilm-paper">
        <StudentSidebar className="hidden md:flex" />
        <div className="flex min-h-screen flex-1 flex-col">
          <StudentTopbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGate>
  );
}
