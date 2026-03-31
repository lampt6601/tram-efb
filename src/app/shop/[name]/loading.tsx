import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountCardSkeleton } from "@/components/storefront/AccountCardSkeleton";

export default function ShopLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        {/* Hero — Seller profile */}
        <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/50">
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
            {/* Back link */}
            <Skeleton className="mb-4 h-5 w-28" />

            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Skeleton className="h-14 w-14 shrink-0 rounded-2xl sm:h-20 sm:w-20" />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <Skeleton className="h-7 w-36 sm:h-8 sm:w-48" />

                {/* Stats badges */}
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>

                {/* Contact buttons */}
                <div className="mt-3 flex gap-2">
                  <Skeleton className="h-8 w-28 rounded-lg" />
                  <Skeleton className="h-8 w-28 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Available accounts */}
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          {/* Section label */}
          <div className="mb-4 flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Account grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <AccountCardSkeleton key={i} />
            ))}
          </div>

          {/* Sold section */}
          <div className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-28" />
            </div>
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-[85vw] max-w-[320px] shrink-0 sm:w-[340px]">
                  <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm">
                    <Skeleton className="aspect-video w-full rounded-none" />
                    <div className="p-3 sm:p-4">
                      <Skeleton className="h-[18px] w-full mb-1.5" />
                      <Skeleton className="h-[18px] w-1/2 mb-3" />
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
