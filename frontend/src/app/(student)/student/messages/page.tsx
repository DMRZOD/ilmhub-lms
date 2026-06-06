import { Suspense } from "react";
import type { Metadata } from "next";

import { StudentMessagesContent } from "./messages-content";

export const metadata: Metadata = {
  title: "Xabarlar",
};

export default function StudentMessagesPage() {
  return (
    <Suspense fallback={null}>
      <StudentMessagesContent />
    </Suspense>
  );
}
