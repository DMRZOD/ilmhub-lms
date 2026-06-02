import type { Metadata } from "next";

import { UstozDashboardContent } from "./dashboard-content";

export const metadata: Metadata = {
  title: "Ustoz dashboardi · IlmHub",
};

export default function UstozDashboardPage() {
  return <UstozDashboardContent />;
}
