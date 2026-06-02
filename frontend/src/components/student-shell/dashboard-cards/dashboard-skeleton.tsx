import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-sp-7">
      <Card padding="lg" className="flex items-center justify-between gap-sp-5">
        <div className="flex flex-col gap-sp-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-20 w-20 rounded-ilm-full" />
      </Card>
      <Card padding="none" className="overflow-hidden p-sp-5">
        <div className="flex flex-col gap-sp-5 sm:flex-row">
          <Skeleton className="aspect-video w-full sm:w-64" />
          <div className="flex flex-1 flex-col gap-sp-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </Card>
      <div className="grid gap-sp-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} padding="none" className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="space-y-sp-3 p-sp-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          </Card>
        ))}
      </div>
      <Card padding="lg">
        <Skeleton className="h-48 w-full" />
      </Card>
    </div>
  );
}
