import type { Metadata } from "next";

import { SertifikatlarContent } from "./certificates-content";

export const metadata: Metadata = {
  title: "Sertifikatlar",
};

export default function SertifikatlarPage() {
  return <SertifikatlarContent />;
}
