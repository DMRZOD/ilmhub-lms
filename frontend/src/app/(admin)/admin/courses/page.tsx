import type { Metadata } from "next";

import { CoursesContent } from "./courses-content";

export const metadata: Metadata = {
  title: "Kurslar moderatsiyasi · IlmHub",
};

export default function AdminCoursesPage() {
  return <CoursesContent />;
}
