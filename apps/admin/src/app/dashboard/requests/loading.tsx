import { Skeleton } from "@thc-efb/ui/skeleton";

export default function RequestsLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-28 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-3">
          <Skeleton className="h-10 w-full rounded-xl md:flex-1 md:min-w-48" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-28 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 last:border-0 px-4 py-3">
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-full max-w-xs mb-1" />
              <Skeleton className="h-3 w-3/4 max-w-[200px]" />
            </div>
            <Skeleton className="h-4 w-14 shrink-0" />
            <Skeleton className="h-4 w-20 shrink-0 hidden sm:block" />
            <Skeleton className="h-6 w-18 rounded-full shrink-0" />
            <Skeleton className="h-7 w-20 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
