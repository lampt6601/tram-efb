import { Skeleton } from "@/components/ui/skeleton";

function ReviewCardSkeleton({ isPending = false }: { isPending?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isPending
          ? "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-3.5 w-3.5 rounded-sm" />
              ))}
            </div>
          </div>
          <Skeleton className="h-4 w-full max-w-lg mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex gap-1.5 shrink-0">
          {isPending && <Skeleton className="h-7 w-7 rounded-lg" />}
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ReviewsLoading() {
  return (
    <div className="p-6">
      <Skeleton className="h-7 w-40 mb-1" />
      <Skeleton className="h-4 w-52" />

      {/* Pending section */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <ReviewCardSkeleton key={i} isPending />
          ))}
        </div>
      </div>

      {/* Approved section */}
      <div className="mt-8">
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
