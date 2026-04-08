export default function PendingReviewLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded-md bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-64 rounded-md bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-8 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40" />
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="h-4 w-44 rounded-md bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-28 rounded-md bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-3 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 w-20 rounded-md bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 w-28 rounded-md bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="h-8 w-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
                <div className="h-8 w-24 rounded-lg bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="h-8 w-24 rounded-lg bg-indigo-100 dark:bg-indigo-900/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

