import { Skeleton } from "@/components/ui/skeleton";

function ApplicationCardSkeleton({ isPending = false }: { isPending?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isPending
          ? "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-28 mb-1" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      {/* Contact info */}
      <div className="flex flex-wrap gap-3 mb-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-full max-w-md mb-1" />
      <Skeleton className="h-3 w-24" />
      {isPending && (
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      )}
    </div>
  );
}

export default function ApplicationsLoading() {
  return (
    <div className="p-6">
      <Skeleton className="h-7 w-44 mb-1" />
      <Skeleton className="h-4 w-56" />

      {/* Pending section */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <ApplicationCardSkeleton key={i} isPending />
          ))}
        </div>
      </div>

      {/* Processed section */}
      <div className="mt-8">
        <Skeleton className="h-4 w-28 mb-3" />
        <div className="space-y-3">
          <ApplicationCardSkeleton />
        </div>
      </div>
    </div>
  );
}
