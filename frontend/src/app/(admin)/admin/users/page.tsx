import type { Metadata } from "next";

import { UsersContent } from "./users-content";

export const metadata: Metadata = {
  title: "Foydalanuvchilar · IlmHub",
};

export default function AdminUsersPage() {
  return <UsersContent />;
}
