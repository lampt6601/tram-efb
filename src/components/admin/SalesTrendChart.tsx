"use client";

import { useMemo } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";

interface SalesDataPoint {
  date: string; // YYYY-MM-DD
  count: number;
  revenue: number;
}

interface SalesTrendChartProps {
  data: SalesDataPoint[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const { maxCount, maxRevenue, bars } = useMemo(() => {
    const mc = Math.max(...data.map((d) => d.count), 1);
    const mr = Math.max(...data.map((d) => d.revenue), 1);
    return {
      maxCount: mc,
      maxRevenue: mr,
      bars: data,
    };
  }, [data]);

  const totalSold = data.reduce((s, d) => s + d.count, 0);
  const totalRev = data.reduce((s, d) => s + d.revenue, 0);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-900">
            Xu hướng bán hàng (30 ngày)
          </h3>
        </div>
        <p className="text-sm text-slate-400">Chưa có dữ liệu bán hàng.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-900">
            Xu hướng bán hàng (30 ngày)
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" /> Số acc bán
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Doanh thu
          </span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-700">
            {totalSold} acc bán
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5">
          <span className="text-xs font-semibold text-emerald-700">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }).format(totalRev)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-[3px] h-32">
        {bars.map((bar, i) => {
          const countHeight = (bar.count / maxCount) * 100;
          const revHeight = (bar.revenue / maxRevenue) * 100;
          const dateObj = new Date(bar.date);
          const label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

          return (
            <div
              key={bar.date}
              className="group relative flex flex-col items-center flex-1 min-w-0"
            >
              {/* Tooltip */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-[10px] text-white shadow-lg">
                <p className="font-medium">{label}</p>
                <p>Bán: {bar.count} acc</p>
                <p>
                  DT:{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    maximumFractionDigits: 0,
                  }).format(bar.revenue)}
                  đ
                </p>
              </div>

              {/* Bars */}
              <div className="flex items-end gap-px w-full h-full">
                <div
                  className="flex-1 rounded-t-sm bg-indigo-400 transition-all group-hover:bg-indigo-500"
                  style={{ height: `${Math.max(countHeight, 2)}%` }}
                />
                <div
                  className="flex-1 rounded-t-sm bg-emerald-300 transition-all group-hover:bg-emerald-400"
                  style={{ height: `${Math.max(revHeight, 2)}%` }}
                />
              </div>

              {/* Date label (show every few days to avoid crowding) */}
              {(i === 0 || i === bars.length - 1 || i % 7 === 0) && (
                <span className="mt-1 text-[9px] text-slate-400">{label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
