import type { Metadata } from "next";

import { RefundsContent } from "./refunds-content";

export const metadata: Metadata = {
  title: "Pul qaytarish · IlmHub",
};

export default function AdminRefundsPage() {
  return <RefundsContent />;
}
