import type { Metadata } from "next";

import { SettingsContent } from "./settings-content";

export const metadata: Metadata = {
  title: "Sozlamalar",
};

export default function AdminSettingsPage() {
  return <SettingsContent />;
}
