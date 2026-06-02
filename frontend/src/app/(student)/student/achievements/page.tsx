import type { Metadata } from "next";

import { YutuqlarContent } from "./achievements-content";

export const metadata: Metadata = {
  title: "Yutuqlar · IlmHub",
};

export default function YutuqlarPage() {
  return <YutuqlarContent />;
}
