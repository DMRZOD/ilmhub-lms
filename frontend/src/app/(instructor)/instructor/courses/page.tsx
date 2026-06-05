import type { Metadata } from "next";

import { KurslarContent } from "./courses-content";

export const metadata: Metadata = {
  title: "Mening kurslarim",
};

export default function KurslarPage() {
  return <KurslarContent />;
}
