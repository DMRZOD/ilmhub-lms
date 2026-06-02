import type { Metadata } from "next";

import { RevenueContent } from "./revenue-content";

export const metadata: Metadata = {
  title: "Daromad · IlmHub",
};

export default function RevenuePage() {
  return <RevenueContent />;
}
