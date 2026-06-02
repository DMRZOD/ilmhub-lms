import type { Metadata } from "next";

import { CourseModerationContent } from "./moderation-content";

export const metadata: Metadata = {
  title: "Kursni ko'rib chiqish · IlmHub",
};

export default async function AdminCourseModerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CourseModerationContent id={id} />;
}
