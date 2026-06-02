import { RoleGate } from "@/components/auth/role-gate";

export default function LearningGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate roles={["STUDENT", "INSTRUCTOR", "ADMIN"]}>
      <div className="min-h-screen bg-ilm-paper">{children}</div>
    </RoleGate>
  );
}
