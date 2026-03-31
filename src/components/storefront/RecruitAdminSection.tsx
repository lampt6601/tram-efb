import Link from "next/link";
import { UserPlus, ArrowRight, Upload } from "lucide-react";

const ZALO_GROUP_THU_ACC = "https://zalo.me/g/fjeogxfhlpwwz1n9wksx";

export function RecruitAdminSection() {
  return (
    <section className="border-t border-indigo-100 bg-gradient-to-r from-indigo-50 via-slate-50 to-purple-50 dark:border-indigo-500/20 dark:from-indigo-950/30 dark:via-slate-800 dark:to-purple-950/30">
      <div className="mx-auto max-w-7xl divide-y divide-slate-200 px-4 sm:px-6 lg:px-8 dark:divide-slate-700">
        {/* Mở gian hàng */}
        <Link
          href="/seller/apply"
          className="flex items-center justify-between gap-4 py-3.5 transition-opacity hover:opacity-80"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
              <UserPlus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Mở Gian Hàng Bán Acc
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                Miễn phí
              </span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-indigo-400" />
        </Link>

        {/* Bán acc cho shop */}
        <a
          href={ZALO_GROUP_THU_ACC}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 py-3.5 transition-opacity hover:opacity-80"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
              <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Bán Acc Cho Shop
            </span>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-emerald-400" />
        </a>
      </div>
    </section>
  );
}
