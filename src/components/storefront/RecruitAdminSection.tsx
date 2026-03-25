import Link from "next/link";
import { UserPlus, ArrowRight } from "lucide-react";

export function RecruitAdminSection() {
  return (
    <section className="border-t border-indigo-100 bg-gradient-to-r from-indigo-50 via-slate-50 to-purple-50 dark:border-indigo-500/20 dark:from-indigo-950/30 dark:via-slate-800 dark:to-purple-950/30">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/seller/apply"
          className="flex items-center justify-between gap-4 transition-opacity hover:opacity-80"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
              <UserPlus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Trở Thành Đối Tác Bán Hàng
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                Đang tuyển
              </span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-indigo-400" />
        </Link>
      </div>
    </section>
  );
}
