import type { Metadata } from "next";

import { StudentsContent } from "./students-content";

export const metadata: Metadata = {
  title: "Talabalar",
};

export default function TalabalarPage() {
  return <StudentsContent />;
}
