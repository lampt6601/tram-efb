import { Skeleton } from "@/components/ui/skeleton";

export default function SellRequestsLoading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-3 w-full max-w-xs mb-1.5" />
                <Skeleton className="h-3 w-2/3 max-w-[200px]" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            </div>
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
