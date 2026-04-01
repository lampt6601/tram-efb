import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountCardSkeleton } from "@/components/storefront/AccountCardSkeleton";

export default function AccountDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl overflow-x-hidden px-3 py-2 sm:px-6 sm:py-8 lg:px-8">
          {/* Back link */}
          <Skeleton className="mb-2 h-5 w-36 sm:mb-4" />

          {/* 2-column layout */}
          <div className="grid min-w-0 max-w-full grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-5">
            {/* Left — Image area */}
            <Skeleton className="aspect-video w-full rounded-2xl lg:col-span-3" />

            {/* Right — Info card */}
            <Skeleton className="h-[420px] w-full rounded-2xl sm:h-[480px] lg:col-span-2" />
          </div>

          {/* Related accounts */}
          <section className="mt-8 sm:mt-10">
            <Skeleton className="mb-4 h-6 w-44 sm:h-7" />
            <div className="-mx-4 flex gap-3 overflow-x-auto pl-4 pr-4 pb-3 snap-x snap-mandatory scroll-pl-4 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pl-0 sm:pr-0 sm:pb-0 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-[65vw] max-w-[280px] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink">
                  <AccountCardSkeleton />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
