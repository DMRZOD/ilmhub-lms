import type { Metadata } from "next";

import { RevenueContent } from "./revenue-content";

export const metadata: Metadata = {
  title: "Daromad",
};

export default function RevenuePage() {
  return <RevenueContent />;
}
