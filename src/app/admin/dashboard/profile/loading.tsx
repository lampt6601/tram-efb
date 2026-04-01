import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-lg">
      {/* Header — icon + text */}
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div>
          <Skeleton className="h-8 w-40 mb-1" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Profile card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        {/* Card header — avatar + name */}
        <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div>
              <Skeleton className="h-5 w-28 mb-1" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="p-6 space-y-6">
          {/* Avatar upload */}
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>

          {/* Profile form fields */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-1.5" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-4 w-12 mb-1.5" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-1.5" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Change password section */}
      <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
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
  );
}
