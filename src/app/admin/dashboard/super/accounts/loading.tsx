import { Skeleton } from "@/components/ui/skeleton";

export default function SuperAccountsLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <div>
            <Skeleton className="h-8 w-52 mb-2" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Filters — amber border matches actual */}
      <div className="mb-4 rounded-xl border border-amber-100 dark:border-amber-500/20 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <div className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center md:gap-3">
          <Skeleton className="h-10 w-full rounded-xl md:flex-1 md:min-w-48" />
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Table — 8 columns matching actual */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16 hidden sm:block" />
              <Skeleton className="h-4 w-16 hidden md:block" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-14 hidden lg:block" />
              <Skeleton className="h-4 w-20 hidden lg:block" />
              <Skeleton className="ml-auto h-4 w-16" />
            </div>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 last:border-0 px-4 py-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Skeleton className="hidden h-9 w-9 rounded-lg shrink-0 sm:block" />
                <Skeleton className="h-4 w-32 sm:w-48" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full hidden sm:block" />
              <Skeleton className="h-4 w-16 hidden md:block" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-5 w-20 rounded-full hidden lg:block" />
              <Skeleton className="h-4 w-28 hidden lg:block" />
              <Skeleton className="h-7 w-14 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
