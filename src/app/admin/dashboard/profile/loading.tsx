import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center">
          <Skeleton className="mx-auto h-24 w-24 rounded-full mb-4" />
          <Skeleton className="mx-auto h-5 w-32 mb-1" />
          <Skeleton className="mx-auto h-3 w-44 mb-4" />
          <Skeleton className="mx-auto h-9 w-32 rounded-lg" />
        </div>

        {/* Form */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <Skeleton className="h-5 w-36 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-1.5" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-1.5" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>

          <div className="mt-8 border-t pt-6 border-slate-100 dark:border-slate-700">
            <Skeleton className="h-5 w-28 mb-4" />
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-28 mb-1.5" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-1.5" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
