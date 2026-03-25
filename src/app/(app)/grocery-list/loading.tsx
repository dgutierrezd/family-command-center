import { Skeleton } from "@/components/ui/skeleton";

export default function GroceryListLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-36" />

      {/* Add form skeleton */}
      <Skeleton className="h-16 w-full rounded-xl" />

      {/* Category groups */}
      {Array.from({ length: 3 }).map((_, group) => (
        <div key={group} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          {Array.from({ length: 4 }).map((_, item) => (
            <div key={item} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
