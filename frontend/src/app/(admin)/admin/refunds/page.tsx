import type { Metadata } from "next";

import { RefundsContent } from "./refunds-content";

export const metadata: Metadata = {
  title: "Pul qaytarish",
};

export default function AdminRefundsPage() {
  return <RefundsContent />;
}
