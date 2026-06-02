import { LessonPlayerView } from "@/components/features/learning/lesson-player-view";

type Params = Promise<{ lessonId: string }>;

export default async function LessonPage({ params }: { params: Params }) {
  const { lessonId } = await params;
  return <LessonPlayerView lessonId={lessonId} />;
}
