import { Skeleton } from "@/components/ui/skeleton";

export default function MealsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-8 w-8" />
      </div>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1">
          <div />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>

        {/* Meal rows */}
        {Array.from({ length: 4 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-[100px_repeat(7,1fr)] gap-1"
          >
            <Skeleton className="h-16" />
            {Array.from({ length: 7 }).map((_, col) => (
              <Skeleton key={col} className="h-16" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
