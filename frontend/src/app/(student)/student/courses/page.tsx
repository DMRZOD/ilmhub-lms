import type { Metadata } from "next";

import { MeningKurslarimContent } from "./courses-content";

export const metadata: Metadata = {
  title: "Mening kurslarim · IlmHub",
};

export default function MeningKurslarimPage() {
  return <MeningKurslarimContent />;
}
