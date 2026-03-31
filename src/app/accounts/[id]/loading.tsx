import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl overflow-x-hidden px-3 py-2 sm:px-6 sm:py-8 lg:px-8">
          {/* Back link + Share */}
          <div className="mb-2 flex items-center justify-between sm:mb-4">
            <Skeleton className="h-5 w-36" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>

          {/* 2-column layout — lg:grid-cols-5 matches real page */}
          <div className="grid min-w-0 max-w-full grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-5">
            {/* Left — Image gallery (lg:col-span-3) */}
            <div className="relative min-w-0 overflow-hidden rounded-2xl bg-white shadow-sm lg:col-span-3 dark:bg-slate-800">
              <Skeleton className="aspect-video w-full rounded-none" />
              {/* Thumbnail row */}
              <div className="flex gap-1.5 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-14 rounded-lg sm:h-16 sm:w-16" />
                ))}
              </div>
            </div>

            {/* Right — Info card (lg:col-span-2, sticky) */}
            <div className="min-w-0 overflow-hidden rounded-2xl bg-white p-3.5 shadow-sm sm:p-6 lg:col-span-2 lg:sticky lg:top-4 lg:self-start dark:bg-slate-800">
              {/* Title + star */}
              <Skeleton className="h-6 w-[85%] sm:h-7" />
              <Skeleton className="mt-1 h-6 w-3/5 sm:h-7" />

              {/* Server tag */}
              <Skeleton className="mt-2 h-[22px] w-28 rounded-full" />

              {/* Price + Buy button */}
              <div className="mt-2 sm:mt-4">
                <Skeleton className="h-[10px] w-10 mb-1" />
                <div className="flex items-center justify-between gap-3 mt-0.5 sm:mt-1">
                  <Skeleton className="h-8 w-28 sm:h-9" />
                  <Skeleton className="h-10 w-28 rounded-xl sm:h-11" />
                </div>
              </div>

              {/* Divider */}
              <div className="my-3 border-t border-slate-100 sm:my-4 dark:border-slate-700" />

              {/* Description box */}
              <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-[90%]" />
                  <Skeleton className="h-3.5 w-3/4" />
                </div>
              </div>

              {/* Stats grid — 2-col on mobile, matches real layout */}
              <div className="mb-3 grid grid-cols-2 gap-1.5 sm:mb-4 sm:gap-2">
                {[
                  { border: "border-amber-100 dark:border-amber-500/20", bg: "bg-amber-50 dark:bg-amber-500/10" },
                  { border: "border-emerald-100 dark:border-emerald-500/20", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                  { border: "border-blue-100 dark:border-blue-500/20", bg: "bg-blue-50 dark:bg-blue-500/10" },
                  { border: "border-indigo-100 dark:border-indigo-500/20", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
                ].map((s, i) => (
                  <div key={i} className={`flex items-center gap-2 rounded-xl border ${s.border} ${s.bg} px-2.5 py-2 sm:gap-2.5 sm:px-3 sm:py-2.5`}>
                    <Skeleton className="h-4 w-4 rounded shrink-0" />
                    <div className="min-w-0">
                      <Skeleton className="h-[10px] w-12 mb-1" />
                      <Skeleton className="h-4 w-14" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Security badge */}
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <Skeleton className="h-4 w-4 rounded shrink-0" />
                <Skeleton className="h-3 w-52" />
              </div>

              {/* Shop owner card */}
              <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-[10px] w-36 mb-1.5" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>

              {/* Buyback policy */}
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>

          {/* Related accounts */}
          <div className="mt-8 sm:mt-12 px-0">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-44" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm">
                  <Skeleton className="aspect-video w-full rounded-none" />
                  <div className="p-3">
                    <Skeleton className="h-[15px] w-full mb-1.5" />
                    <Skeleton className="h-[15px] w-3/5 mb-2" />
                    <div className="flex items-end justify-between border-t border-slate-100 dark:border-slate-700 pt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-14 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
