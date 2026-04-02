import { Skeleton } from "@thc-efb/ui/skeleton";

export default function RevenueLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-52 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-8 w-24" />
            <Skeleton className="mt-2 h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-52" />
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>

      {/* Admin filter */}
      <div className="mt-6">
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>

      {/* Admin revenue table */}
      <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16 hidden sm:block" />
            <Skeleton className="h-4 w-16 hidden sm:block" />
            <Skeleton className="h-4 w-16 hidden md:block" />
            <Skeleton className="ml-auto h-4 w-20" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 last:border-0 px-4 py-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Skeleton className="h-7 w-7 rounded-lg shrink-0 hidden sm:block" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-8 hidden sm:block" />
            <Skeleton className="h-4 w-8 hidden sm:block" />
            <Skeleton className="h-4 w-12 hidden md:block" />
            <Skeleton className="h-4 w-20 font-semibold" />
          </div>
        ))}
      </div>

      {/* Daily breakdown */}
      <div className="mt-8">
        <Skeleton className="h-6 w-56 mb-4" />
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-16 hidden sm:block" />
              <Skeleton className="h-4 w-16 hidden sm:block" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="ml-auto h-4 w-20" />
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 last:border-0 px-4 py-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-8 hidden sm:block" />
              <Skeleton className="h-4 w-8 hidden sm:block" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="ml-auto h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
