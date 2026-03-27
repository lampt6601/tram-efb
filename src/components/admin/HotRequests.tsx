import { Flame, Banknote, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { AccountRequest } from "@/types/database";

interface HotRequestsProps {
  requests: AccountRequest[];
}

export function HotRequests({ requests }: HotRequestsProps) {
  if (requests.length === 0) return null;

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-5 dark:border-orange-500/20 dark:bg-orange-500/5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Khách Đang Tìm
          </h2>
          <span className="rounded-full bg-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
            {requests.length}
          </span>
        </div>
        <Link
          href="/admin/dashboard/requests"
          className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          Xem tất cả <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-2.5">
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex items-start gap-3 rounded-lg border border-orange-100 bg-white px-3.5 py-2.5 dark:border-orange-500/10 dark:bg-slate-800"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                {req.detail}
              </p>
              {req.price_level && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Banknote className="h-3 w-3" />
                  {req.price_level}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-orange-600/70 dark:text-orange-400/60">
        Thu mua acc phù hợp với yêu cầu trên sẽ dễ bán hơn!
      </p>
    </div>
  );
}
