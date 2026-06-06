import { LessonPlayerView } from "@/components/features/learning/lesson-player-view";

type Params = Promise<{ lessonId: string }>;
type SearchParams = Promise<{ tab?: string }>;

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { lessonId } = await params;
  const { tab } = await searchParams;
  const initialTab = tab === "elonlar" ? "elonlar" : undefined;
  return <LessonPlayerView lessonId={lessonId} initialTab={initialTab} />;
}
