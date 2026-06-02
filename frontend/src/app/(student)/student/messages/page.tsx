import type { Metadata } from "next";

import { StudentMessagesContent } from "./messages-content";

export const metadata: Metadata = {
  title: "Xabarlar · IlmHub",
};

export default function StudentMessagesPage() {
  return <StudentMessagesContent />;
}
