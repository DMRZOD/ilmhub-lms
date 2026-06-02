import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoader } from "@/components/instructor-shell/page-states";
import { MessagesContent } from "./messages-content";

export const metadata: Metadata = {
  title: "Aloqalar · IlmHub",
};

export default function MessagesPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MessagesContent />
    </Suspense>
  );
}
