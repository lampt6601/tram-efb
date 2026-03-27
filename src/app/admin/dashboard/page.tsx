import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { formatCurrency } from "@/lib/constants";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { DashboardPeriodFilter } from "./DashboardPeriodFilter";
import { SalesTrendChart } from "@/components/admin/SalesTrendChart";
import { HotRequests } from "@/components/admin/HotRequests";
import { CTVLeaderboard } from "@/components/admin/CTVLeaderboard";
import {
  Package,
  CheckCircle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  ExternalLink,
  Timer,
} from "lucide-react";
import Link from "next/link";
import type { Account, AccountRequest } from "@/types/database";

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
  const start = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  return start.toISOString();
}

function getVNDateStr(isoString: string) {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type SearchParams = { period?: string; from?: string; to?: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const period = params.period ?? "";
  const fromDate = params.from ?? "";
  const toDate = params.to ?? "";

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

  const soldInPeriod = soldItems.filter((a) => {
    if (sinceISO && (a.updated_at ?? a.created_at) < sinceISO) return false;
    const dStr = getVNDateStr(a.updated_at ?? a.created_at);
    if (fromDate && dStr < fromDate) return false;
    if (toDate && dStr > toDate) return false;
    return true;
  });

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

  let periodLabel = "";
  if (fromDate && toDate) periodLabel = ` (${fromDate.split("-").reverse().join("/")} - ${toDate.split("-").reverse().join("/")})`;
  else if (fromDate) periodLabel = ` (từ ${fromDate.split("-").reverse().join("/")})`;
  else if (toDate) periodLabel = ` (đến ${toDate.split("-").reverse().join("/")})`;
  else if (period === "week") periodLabel = " (theo tuần)";
  else if (period === "month") periodLabel = " (theo tháng)";

  // Sales trend data (last 30 days)
  const now = new Date();
  const salesTrendData = (() => {
    const days = 30;
    const result: { date: string; count: number; revenue: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const daySold = soldItems.filter((a) => {
        const aDate = getVNDateStr(a.updated_at ?? a.created_at);
        return aDate === dateStr;
      });
      result.push({
        date: dateStr,
        count: daySold.length,
        revenue: daySold.reduce((s, a) => s + Number(a.selling_price), 0),
      });
    }
    return result;
  })();

  // Avg time to sell (days from created to updated for sold accounts)
  const avgTimeToSell = (() => {
    const soldWithTime = soldItems.filter((a) => a.updated_at && a.created_at);
    if (soldWithTime.length === 0) return null;
    const totalDays = soldWithTime.reduce((sum, a) => {
      const created = new Date(a.created_at).getTime();
      const sold = new Date(a.updated_at).getTime();
      return sum + Math.max(0, (sold - created) / (1000 * 60 * 60 * 24));
    }, 0);
    return Math.round(totalDays / soldWithTime.length * 10) / 10;
  })();

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  // Pending account requests (visible to all admins via service client)
  const service = createSupabaseServiceClient();
  const { data: pendingRequests } = await service
    .from("account_requests")
    .select("*")
    .eq("completed", false)
    .order("created_at", { ascending: false })
    .limit(5);
  const hotRequests = (pendingRequests ?? []) as AccountRequest[];

  // CTV Leaderboard: all sold accounts this month (cross-user, via service client)
  const monthStart = getStartOfMonthISO();
  const { data: allSoldThisMonth } = await service
    .from("accounts")
    .select("selling_price, user_id")
    .eq("status", "Sold")
    .gte("updated_at", monthStart);

  // Get admin names from auth.users via service client
  const { data: { users: allUsers } } = await service.auth.admin.listUsers();
  const userMap = new Map(
    (allUsers ?? []).map((u) => [
      u.id,
      u.user_metadata?.full_name || u.email || "CTV",
    ]),
  );

  const leaderMap = new Map<string, { name: string; soldCount: number; revenue: number }>();
  for (const acc of allSoldThisMonth ?? []) {
    const uid = acc.user_id as string;
    const existing = leaderMap.get(uid) ?? {
      name: userMap.get(uid) ?? "CTV",
      soldCount: 0,
      revenue: 0,
    };
    existing.soldCount += 1;
    existing.revenue += Number(acc.selling_price);
    leaderMap.set(uid, existing);
  }
  const leaderboard = [...leaderMap.values()]
    .sort((a, b) => b.soldCount - a.soldCount || b.revenue - a.revenue)
    .slice(0, 5);

  const staleAccounts = items
    .filter((a) => a.status !== "Sold" && new Date(a.created_at) < weekAgo)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    .slice(0, 10);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bảng Điều Khiển</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
            totalProfit >= 0 ? "ring-1 ring-emerald-200 dark:ring-emerald-500/30" : "ring-1 ring-red-200 dark:ring-red-500/30"
          }
        />
      </div>

      {/* Avg time to sell */}
      {avgTimeToSell !== null && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Thời gian bán TB"
            value={`${avgTimeToSell} ngày`}
            icon={<Timer className="h-6 w-6" />}
          />
        </div>
      )}

      {/* Sales trend chart */}
      <div className="mt-6">
        <SalesTrendChart data={salesTrendData} />
      </div>

      {/* CTV Leaderboard + Hot Requests */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CTVLeaderboard sellers={leaderboard} />
        <HotRequests requests={hotRequests} />
      </div>

      {staleAccounts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Tài khoản đăng hơn 1 tuần chưa bán
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Đây là những acc đã đăng trên 7 ngày nhưng vẫn chưa được bán. Bạn có
            thể xem lại giá, mô tả hoặc bật ưu tiên để tăng khả năng bán.
          </p>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-slate-50 dark:bg-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
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
                      className="border-t last:border-b text-slate-700 dark:text-slate-200"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/accounts/${account.id}`}
                          target="_blank"
                          className="group inline-flex items-center gap-1.5 max-w-xs truncate font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <span className="truncate group-hover:underline">{account.title}</span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={account.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {created.toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-200">
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
