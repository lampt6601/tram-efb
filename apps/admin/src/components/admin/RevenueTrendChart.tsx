"use client";

import { useMemo } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@thc-efb/ui/tooltip";

interface RevenueDataPoint {
  date: string; // YYYY-MM-DD
  sold: number;
  profit: number;
}

interface RevenueTrendChartProps {
  data: RevenueDataPoint[];
  periodLabel?: string;
}

export function RevenueTrendChart({ data, periodLabel }: RevenueTrendChartProps) {
  const { maxSold, maxProfit, bars } = useMemo(() => {
    const ms = Math.max(...data.map((d) => d.sold), 1);
    const mp = Math.max(...data.map((d) => Math.abs(d.profit)), 1);
    return { maxSold: ms, maxProfit: mp, bars: data };
  }, [data]);

  const totalSold = data.reduce((s, d) => s + d.sold, 0);
  const totalProfit = data.reduce((s, d) => s + d.profit, 0);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Xu hướng doanh thu{periodLabel ? ` ${periodLabel}` : ""}
          </h3>
        </div>
        <p className="text-sm text-slate-400 dark:text-slate-500">Chưa có dữ liệu.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Xu hướng doanh thu{periodLabel ? ` ${periodLabel}` : ""}
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" /> Số acc bán
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Lợi nhuận
          </span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 dark:bg-indigo-500/10">
          <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
            {totalSold} acc bán
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 dark:bg-emerald-500/10">
          <span className={`text-xs font-semibold ${totalProfit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }).format(totalProfit)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <TooltipProvider>
          <div className="flex items-end gap-[3px] h-32">
            {bars.map((bar) => {
              const soldHeight = (bar.sold / maxSold) * 100;
              const profitHeight = (Math.abs(bar.profit) / maxProfit) * 100;
              const label = bar.date.split("-").reverse().join("/").replace(/^0/, "").replace(/\/0/, "/");

              return (
                <Tooltip key={bar.date}>
                  <TooltipTrigger
                    render={<div />}
                    className="group flex items-end gap-px flex-1 min-w-[8px] h-full cursor-default"
                  >
                    <div
                      className="flex-1 rounded-t-sm bg-indigo-400 transition-all group-hover:bg-indigo-500"
                      style={{ height: `${Math.max(soldHeight, 2)}%` }}
                    />
                    <div
                      className={`flex-1 rounded-t-sm transition-all ${bar.profit >= 0 ? "bg-emerald-300 group-hover:bg-emerald-400" : "bg-red-300 group-hover:bg-red-400"}`}
                      style={{ height: `${Math.max(profitHeight, 2)}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px]">
                    <p className="font-medium">{label}</p>
                    <p>Bán: {bar.sold} acc</p>
                    <p>
                      LN:{" "}
                      {new Intl.NumberFormat("vi-VN", {
                        maximumFractionDigits: 0,
                      }).format(bar.profit)}
                      đ
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
        {/* Date labels */}
        <div className="flex gap-[3px] mt-1">
          {bars.map((bar, i) => {
            const dateObj = new Date(bar.date);
            const label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
            return (
              <div key={bar.date} className="flex-1 min-w-[8px] text-center">
                {(i === 0 || i === bars.length - 1 || i % 7 === 0) && (
                  <span className="text-[9px] text-slate-400 dark:text-slate-500">{label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
