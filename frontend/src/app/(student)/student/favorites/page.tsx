import type { Metadata } from "next";

import { SevimlilarContent } from "./favorites-content";

export const metadata: Metadata = {
  title: "Sevimlilar · IlmHub",
};

export default function SevimlilarPage() {
  return <SevimlilarContent />;
}
