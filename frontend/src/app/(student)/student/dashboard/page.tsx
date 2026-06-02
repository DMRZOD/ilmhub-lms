import type { Metadata } from "next";

import { DashboardContent } from "./dashboard-content";

export const metadata: Metadata = {
  title: "Bosh sahifa · IlmHub",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
