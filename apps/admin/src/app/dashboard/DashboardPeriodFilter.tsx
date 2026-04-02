"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@thc-efb/ui/button";

export function DashboardPeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentFrom = searchParams.get("from") || "";
  const currentTo = searchParams.get("to") || "";
  const currentPeriod = searchParams.get("period"); // support older standard

  const [from, setFrom] = useState(currentFrom);
  const [to, setTo] = useState(currentTo);

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (from) params.set("from", from);
    else params.delete("from");

    if (to) params.set("to", to);
    else params.delete("to");

    params.delete("period");

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilter = () => {
    setFrom("");
    setTo("");
    const params = new URLSearchParams(searchParams);
    params.delete("from");
    params.delete("to");
    params.delete("period");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-sm">
      <div className="flex items-center gap-2 px-2">
        <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Lọc theo ngày:</span>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 px-3 py-1.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          title="Từ ngày"
        />
        <span className="text-sm text-slate-400 dark:text-slate-500">-</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 px-3 py-1.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          title="Đến ngày"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={applyFilter} size="sm" className="h-8 rounded-xl">
          Áp dụng
        </Button>
        {(currentFrom || currentTo || currentPeriod) && (
          <Button onClick={clearFilter} variant="outline" size="sm" className="h-8 rounded-xl">
            Xóa lọc
          </Button>
        )}
      </div>
    </div>
  );
}
