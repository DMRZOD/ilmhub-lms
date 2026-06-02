import type { Metadata } from "next";

import { AdminDashboardContent } from "./dashboard-content";

export const metadata: Metadata = {
  title: "Boshqaruv paneli · IlmHub",
};

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
