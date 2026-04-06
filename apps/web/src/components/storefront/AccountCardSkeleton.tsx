import { Skeleton } from '@thc-efb/ui/skeleton';

export function AccountCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-800 shadow-sm">
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-700 aspect-[16/9]">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Title */}
        <div>
          <Skeleton className="h-[16px] w-full mb-1" />
          <Skeleton className="h-[16px] w-3/5" />
        </div>

        {/* Spacer */}
        <div className="mt-auto" />

        {/* Price row */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16 sm:h-6" />
          </div>
          <Skeleton className="h-5 w-[60px] rounded-md" />
        </div>

        {/* Seller row */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-700/60 pt-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="ml-auto h-3 w-8" />
        </div>
      </div>
    </div>
  );
}

export function AccountGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:items-stretch">
      {Array.from({ length: count }).map((_, i) => (
        <AccountCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FiltersSkeleton() {
  return (
    <div>
      {/* ── Desktop: single row ── */}
      <div className="hidden items-center gap-2 md:flex">
        <Skeleton className="h-9 min-w-0 flex-1 rounded-lg" />
        <Skeleton className="h-9 w-28 shrink-0 rounded-lg" />
        <Skeleton className="h-9 w-[76px] shrink-0 rounded-lg" />
        <Skeleton className="h-9 w-56 shrink-0 rounded-lg" />
        <Skeleton className="h-9 w-16 shrink-0 rounded-lg" />
        <Skeleton className="h-9 w-16 shrink-0 rounded-lg" />
      </div>

      {/* ── Mobile: stacked rows ── */}
      <div className="flex flex-col gap-1.5 md:hidden">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-9 min-w-0 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-[72px] shrink-0 rounded-lg" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-24 shrink-0 rounded-lg" />
          <Skeleton className="h-8 min-w-0 flex-1 rounded-lg" />
          <Skeleton className="h-8 w-14 shrink-0 rounded-lg" />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-8 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
