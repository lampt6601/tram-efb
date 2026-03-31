import { Header } from "@/components/storefront/Header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AccountGridSkeleton,
  FiltersSkeleton,
} from "@/components/storefront/AccountCardSkeleton";

export default function HomeLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        {/* Hero — matches gradient-bg section */}
        <section className="gradient-bg relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-4 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="flex flex-col py-3 sm:py-6 md:py-10">
              <div className="text-center lg:text-left">
                {/* Owner badge */}
                <div className="mx-auto mb-5 inline-flex items-center gap-2.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 py-1.5 pl-1.5 pr-4 lg:mx-0">
                  <Skeleton className="h-7 w-7 rounded-full bg-indigo-500/20" />
                  <Skeleton className="h-3 w-40 bg-white/10" />
                </div>

                {/* Heading */}
                <div className="space-y-2">
                  <Skeleton className="mx-auto lg:mx-0 h-9 w-[280px] sm:h-10 sm:w-[360px] lg:h-12 bg-white/10" />
                  <Skeleton className="mx-auto lg:mx-0 h-9 w-[200px] sm:h-10 sm:w-[240px] lg:h-12 bg-indigo-400/20" />
                </div>

                {/* Recruit CTA */}
                <Skeleton className="mx-auto lg:mx-0 mt-5 h-10 w-56 rounded-full bg-white/10" />

                {/* Stats bar */}
                <div className="mx-auto lg:mx-0 mt-6 flex justify-center lg:justify-start gap-6 sm:gap-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center lg:items-start gap-1">
                      <Skeleton className="h-7 w-12 bg-white/15" />
                      <Skeleton className="h-3 w-16 bg-white/8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Grid section — matches real layout */}
        <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-12 lg:px-8 lg:py-10">
          {/* Section heading */}
          <Skeleton className="mb-3 sm:mb-4 h-7 w-48 sm:h-8 sm:w-56" />

          {/* Filters */}
          <div className="mb-5 sm:mb-8">
            <FiltersSkeleton />
          </div>

          {/* Featured label */}
          <div className="mb-4 flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>

          {/* Account cards grid */}
          <AccountGridSkeleton count={6} />
        </section>

        {/* Sold accounts section */}
        <section className="border-t border-slate-200 bg-slate-100/60 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
            {/* Section header */}
            <div className="mb-6 sm:mb-8 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-7 w-48 sm:h-8" />
              <Skeleton className="mt-1 h-4 w-64" />
            </div>

            {/* Horizontal scroll cards */}
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[85vw] max-w-[320px] shrink-0 sm:w-[340px] lg:w-[380px]"
                >
                  <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm">
                    <Skeleton className="aspect-video w-full rounded-none" />
                    <div className="p-3 sm:p-4">
                      <Skeleton className="h-[18px] w-full mb-1.5" />
                      <Skeleton className="h-[18px] w-1/2 mb-3" />
                      <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <div className="flex items-end justify-between border-t border-slate-100 dark:border-slate-700 pt-2.5">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-6 w-[72px] rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Zalo notify CTA */}
        <section className="border-t border-slate-200 dark:border-slate-700">
          <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10">
            <div className="flex flex-col items-center text-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="mt-2 h-10 w-40 rounded-full" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
