import { RoleGate } from "@/components/auth/role-gate";

export default function AccountGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate roles={["STUDENT", "INSTRUCTOR", "ADMIN"]}>{children}</RoleGate>
  );
}
