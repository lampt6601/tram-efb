import { Skeleton } from "@/components/ui/skeleton";

function SellRequestCardSkeleton({ isPending = false }: { isPending?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isPending
          ? "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
      }`}
    >
      {/* Name + status badge */}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* Phone + price */}
      <div className="mt-2 flex gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Description */}
      <Skeleton className="mt-2 h-4 w-full max-w-sm" />

      {/* Image thumbnail */}
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-16 w-28 rounded-lg" />
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Date */}
      <Skeleton className="mt-1 h-3 w-32" />

      {/* Action buttons */}
      {isPending && (
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      )}
    </div>
  );
}

export default function SellRequestsLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-48 mb-1" />
      <Skeleton className="h-4 w-64" />

      {/* Pending section */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <SellRequestCardSkeleton key={i} isPending />
          ))}
        </div>
      </div>

      {/* Contacted section */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-3">
          <SellRequestCardSkeleton />
        </div>
      </div>
    </div>
  );
}
