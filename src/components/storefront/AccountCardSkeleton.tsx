import { Skeleton } from "@/components/ui/skeleton";

export function AccountCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm">
      {/* Image — aspect-video matches AccountCard */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 aspect-video">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>

      {/* Content — matches p-3 sm:p-4 */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Title — min-h-[2.75rem] line-clamp-2 */}
        <div className="mb-2 min-h-[2.75rem]">
          <Skeleton className="h-[18px] w-full mb-1.5" />
          <Skeleton className="h-[18px] w-3/5" />
        </div>

        {/* Badges — server + clone + collateral */}
        <div className="mt-1.5 min-h-[1.5rem] flex items-center gap-2">
          <Skeleton className="h-5 w-[88px] rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>

        {/* Price section — border-t */}
        <div className="mt-3 sm:mt-4 flex items-end justify-between border-t border-slate-100 dark:border-slate-700 pt-2.5 sm:pt-3">
          <div className="flex flex-col">
            {/* Original price line (sale) */}
            <div className="h-[18px]">
              <Skeleton className="h-3 w-14" />
            </div>
            {/* Selling price */}
            <Skeleton className="h-6 w-24 sm:h-7" />
          </div>
          {/* Status badge */}
          <Skeleton className="h-6 w-[72px] rounded-lg mb-1" />
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
        {/* Search */}
        <Skeleton className="h-9 min-w-0 flex-1 rounded-lg" />
        {/* Sort */}
        <Skeleton className="h-9 w-28 shrink-0 rounded-lg" />
        {/* Clone */}
        <Skeleton className="h-9 w-[76px] shrink-0 rounded-lg" />
        {/* Price range */}
        <Skeleton className="h-9 w-56 shrink-0 rounded-lg" />
        {/* Lọc */}
        <Skeleton className="h-9 w-16 shrink-0 rounded-lg" />
        {/* Tìm */}
        <Skeleton className="h-9 w-16 shrink-0 rounded-lg" />
      </div>

      {/* ── Mobile: stacked rows ── */}
      <div className="flex flex-col gap-1.5 md:hidden">
        {/* Row 1: Search + Clone */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-9 min-w-0 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-[72px] shrink-0 rounded-lg" />
        </div>
        {/* Row 2: Sort + Price + Lọc */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-24 shrink-0 rounded-lg" />
          <Skeleton className="h-8 min-w-0 flex-1 rounded-lg" />
          <Skeleton className="h-8 w-14 shrink-0 rounded-lg" />
        </div>
        {/* Bottom bar: count + clear + apply */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-8 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
