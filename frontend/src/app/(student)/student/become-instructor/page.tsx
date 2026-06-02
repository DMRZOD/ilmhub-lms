import type { Metadata } from "next";

import { UstozBolishContent } from "./become-instructor-content";

export const metadata: Metadata = {
  title: "Ustoz bo'lish · IlmHub",
};

export default function UstozBolishPage() {
  return <UstozBolishContent />;
}
