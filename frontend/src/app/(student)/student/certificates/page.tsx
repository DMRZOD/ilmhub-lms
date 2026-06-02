import type { Metadata } from "next";

import { SertifikatlarContent } from "./certificates-content";

export const metadata: Metadata = {
  title: "Sertifikatlar · IlmHub",
};

export default function SertifikatlarPage() {
  return <SertifikatlarContent />;
}
