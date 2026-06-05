import type { Metadata } from "next";

import { ReportsContent } from "./reports-content";

export const metadata: Metadata = {
  title: "Shikoyatlar",
};

export default function AdminReportsPage() {
  return <ReportsContent />;
}
