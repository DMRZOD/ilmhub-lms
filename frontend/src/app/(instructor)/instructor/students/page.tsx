import type { Metadata } from "next";

import { StudentsContent } from "./students-content";

export const metadata: Metadata = {
  title: "Talabalar · IlmHub",
};

export default function TalabalarPage() {
  return <StudentsContent />;
}
