import { Skeleton } from "@/components/ui/skeleton";

export default function EmailsLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
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
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-28 hidden sm:block" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 last:border-0 px-4 py-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <Skeleton className="h-4 w-40 sm:w-56" />
            </div>
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-7 w-14 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
