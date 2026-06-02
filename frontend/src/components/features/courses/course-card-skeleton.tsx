import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/lib/courses-filter";

export function CourseCardSkeleton({ view = "grid" }: { view?: ViewMode }) {
  const isList = view === "list";
  return (
    <Card
      padding="none"
      className={cn(
        "flex h-full overflow-hidden",
        isList ? "flex-col sm:flex-row" : "flex-col"
      )}
    >
      <Skeleton
        className={cn(
          "aspect-[16/9] rounded-none",
          isList && "sm:aspect-auto sm:h-auto sm:w-80 sm:shrink-0"
        )}
      />
      <div className="flex flex-1 flex-col gap-sp-3 p-sp-5">
        <Skeleton className="h-5 w-24 rounded-ilm-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <div className="flex items-center gap-sp-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-wrap gap-sp-2">
          <Skeleton className="h-6 w-16 rounded-ilm-full" />
          <Skeleton className="h-6 w-16 rounded-ilm-full" />
          <Skeleton className="h-6 w-16 rounded-ilm-full" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-sp-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </Card>
  );
}
