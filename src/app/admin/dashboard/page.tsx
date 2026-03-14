import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/constants";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardPeriodFilter } from "./DashboardPeriodFilter";
import {
  Package,
  CheckCircle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import type { Account } from "@/types/database";

/** Start of current week (Monday 00:00 UTC) as ISO string */
function getStartOfWeekISO(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  const start = new Date(d);
  start.setUTCDate(d.getUTCDate() - daysToMonday);
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

/** Start of current month (1st 00:00 UTC) as ISO string */
function getStartOfMonthISO(): string {
  const d = new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
  return start.toISOString();
}

type SearchParams = { period?: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const period = params.period ?? "";

  const supabase = await createSupabaseServerClient();

  const { data: accounts } = await supabase.from("accounts").select("*");
  const items = (accounts ?? []) as Account[];

  const totalAccounts = items.length;
  const availableAccounts = items.filter(
    (a) => a.status === "Available",
  ).length;

  const soldItems = items.filter((a) => a.status === "Sold");
  const sinceISO =
    period === "week"
      ? getStartOfWeekISO()
      : period === "month"
        ? getStartOfMonthISO()
        : null;
  const soldInPeriod = sinceISO
    ? soldItems.filter((a) => (a.updated_at ?? a.created_at) >= sinceISO)
    : soldItems;

  const soldAccounts = soldInPeriod.length;
  const totalRevenue = soldInPeriod.reduce(
    (sum, a) => sum + Number(a.selling_price),
    0,
  );
  const totalCost = soldInPeriod.reduce(
    (sum, a) => sum + Number(a.purchase_price),
    0,
  );
  const totalProfit = totalRevenue - totalCost;

  const periodLabel =
    period === "week" ? " (theo tuần)" : period === "month" ? " (theo tháng)" : "";

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const staleAccounts = items
    .filter(
      (a) =>
        a.status !== "Sold" &&
        new Date(a.created_at) < weekAgo,
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    .slice(0, 10);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bảng Điều Khiển</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng quan về cửa hàng eFootball của bạn
          </p>
        </div>
        <DashboardPeriodFilter />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Tổng Tài Khoản"
          value={totalAccounts.toString()}
          icon={<Package className="h-6 w-6" />}
        />
        <StatCard
          label="Sẵn Sàng"
          value={availableAccounts.toString()}
          icon={<ShoppingCart className="h-6 w-6" />}
        />
        <StatCard
          label={`Đã Bán${periodLabel}`}
          value={soldAccounts.toString()}
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatCard
          label={`Tổng Doanh Thu${periodLabel}`}
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <StatCard
          label={`Tổng Chi Phí${periodLabel}`}
          value={formatCurrency(totalCost)}
          icon={<BarChart3 className="h-6 w-6" />}
        />
        <StatCard
          label={`Tổng Lợi Nhuận${periodLabel}`}
          value={formatCurrency(totalProfit)}
          icon={<TrendingUp className="h-6 w-6" />}
          className={
            totalProfit >= 0 ? "ring-1 ring-emerald-200" : "ring-1 ring-red-200"
          }
        />
      </div>

      {staleAccounts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Tài khoản đăng hơn 1 tuần chưa bán
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Đây là những acc đã đăng trên 7 ngày nhưng vẫn chưa được bán. Bạn có thể
            xem lại giá, mô tả hoặc bật ưu tiên để tăng khả năng bán.
          </p>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tài khoản</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ngày đăng</th>
                  <th className="px-4 py-3 text-right">Số ngày</th>
                </tr>
              </thead>
              <tbody>
                {staleAccounts.map((account) => {
                  const created = new Date(account.created_at);
                  const days =
                    Math.floor(
                      (now.getTime() - created.getTime()) /
                        (1000 * 60 * 60 * 24),
                    ) || 0;
                  return (
                    <tr
                      key={account.id}
                      className="border-t last:border-b text-slate-700"
                    >
                      <td className="px-4 py-3">
                        <div className="max-w-xs truncate font-medium">
                          {account.title}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {account.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {created.toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-800">
                        {days} ngày
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
