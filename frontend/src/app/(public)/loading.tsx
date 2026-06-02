import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-sp-8 px-sp-4 py-sp-16 md:px-sp-6 md:py-sp-20">
      <div className="flex flex-col gap-sp-4">
        <Skeleton className="h-12 w-3/4 max-w-2xl" />
        <Skeleton className="h-6 w-1/2 max-w-xl" />
      </div>

      <div className="grid gap-sp-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-sp-4 rounded-ilm-2xl bg-ilm-surface p-sp-5"
          >
            <Skeleton className="aspect-video w-full rounded-ilm-md" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
