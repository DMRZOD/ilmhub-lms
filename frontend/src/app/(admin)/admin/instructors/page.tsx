import type { Metadata } from "next";

import { InstructorsContent } from "./instructors-content";

export const metadata: Metadata = {
  title: "Ustozlar",
};

export default function AdminInstructorsPage() {
  return <InstructorsContent />;
}
