import type { Metadata } from "next";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { getAdminUsers } from "@/lib/cached-users";
import { redirect } from "next/navigation";
import { formatCurrency } from "@thc-efb/shared/constants";

export const revalidate = 120; // 2 minutes

export const metadata: Metadata = { title: "Doanh Thu Toàn Shop" };
import { StatCard } from "@thc-efb/ui/stat-card";
import { DashboardPeriodFilter } from "../../DashboardPeriodFilter";
import { AdminRevenueFilter } from "./AdminRevenueFilter";
import {
  Package,
  CheckCircle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import { RevenueTrendChart } from "@/components/admin/RevenueTrendChart";
import type { Account } from "@thc-efb/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@thc-efb/ui/table";
import { Card, CardContent } from "@thc-efb/ui/card";

/** Start of current day (00:00 UTC) as ISO string */
function getStartOfDayISO(): string {
  const d = new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  return start.toISOString();
}

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

type SearchParams = { period?: string; from?: string; to?: string; admins?: string };

export default async function SuperRevenuePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const period = params.period ?? "";
  const fromDate = params.from ?? "";
  const toDate = params.to ?? "";
  const selectedAdminIds = new Set(
    params.admins ? params.admins.split(",").filter(Boolean) : [],
  );

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !checkIsSuperAdmin(user.email)) {
    redirect("/dashboard");
  }

  // Use service client to bypass RLS and get all shop data
  const service = createSupabaseServiceClient();
  const [{ data: accounts }, allUsers] = await Promise.all([
    service.from("accounts").select("id, status, selling_price, purchase_price, user_id, created_at, updated_at"),
    getAdminUsers(),
  ]);

  const items = (accounts ?? []) as Account[];

  // Build admin options list (excluding super admin)
  const adminOptions = allUsers
    .filter((u) => !checkIsSuperAdmin(u.email))
    .sort((a, b) =>
      (a.user_metadata?.full_name ?? a.email ?? "").localeCompare(
        b.user_metadata?.full_name ?? b.email ?? "",
      ),
    )
    .map((u) => ({
      id: u.id,
      name: u.user_metadata?.full_name ?? "",
      email: u.email ?? "",
    }));

  const totalAccounts = items.length;
  const availableAccounts = items.filter(
    (a) => a.status === "Available",
  ).length;

  const soldItems = items.filter((a) => a.status === "Sold");
  const sinceISO =
    period === "day"
      ? getStartOfDayISO()
      : period === "week"
        ? getStartOfWeekISO()
        : period === "month"
          ? getStartOfMonthISO()
          : null;

  function inPeriod(a: Account) {
    if (sinceISO && (a.updated_at ?? a.created_at) < sinceISO) return false;
    const dStr = getVNDateStr(a.updated_at ?? a.created_at);
    if (fromDate && dStr < fromDate) return false;
    if (toDate && dStr > toDate) return false;
    return true;
  }

  const soldInPeriod = soldItems.filter(inPeriod);

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
  else if (period === "day") periodLabel = " (hôm nay)";
  else if (period === "week") periodLabel = " (theo tuần)";
  else if (period === "month") periodLabel = " (theo tháng)";

  type DailyStat = {
    dateStr: string;
    added: number;
    available: number;
    sold: number;
    profit: number;
  };

  const statsMap = new Map<string, DailyStat>();

  items.forEach((a) => {
    const createdDateStr = getVNDateStr(a.created_at);
    if (!statsMap.has(createdDateStr)) {
      statsMap.set(createdDateStr, { dateStr: createdDateStr, added: 0, available: 0, sold: 0, profit: 0 });
    }
    const statCreated = statsMap.get(createdDateStr)!;
    statCreated.added += 1;
    if (a.status === "Available") {
      statCreated.available += 1;
    }

    if (a.status === "Sold") {
      const soldDateStr = getVNDateStr(a.updated_at ?? a.created_at);
      if (!statsMap.has(soldDateStr)) {
        statsMap.set(soldDateStr, { dateStr: soldDateStr, added: 0, available: 0, sold: 0, profit: 0 });
      }
      const statSold = statsMap.get(soldDateStr)!;
      statSold.sold += 1;
      statSold.profit += Number(a.selling_price) - Number(a.purchase_price);
    }
  });

  let displayStats = Array.from(statsMap.values()).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  if (sinceISO) {
    const sinceDateStr = getVNDateStr(sinceISO);
    displayStats = displayStats.filter((s) => s.dateStr >= sinceDateStr);
  }
  if (fromDate || toDate) {
    displayStats = displayStats.filter((s) => {
      if (fromDate && s.dateStr < fromDate) return false;
      if (toDate && s.dateStr > toDate) return false;
      return true;
    });
  }

  // Per-admin stats
  type AdminStat = {
    id: string;
    name: string;
    email: string;
    added: number;
    available: number;
    sold: number;
    revenue: number;
    cost: number;
    profit: number;
  };

  const adminStatMap = new Map<string, AdminStat>();
  for (const opt of adminOptions) {
    adminStatMap.set(opt.id, {
      id: opt.id,
      name: opt.name,
      email: opt.email,
      added: 0,
      available: 0,
      sold: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
    });
  }

  for (const a of items) {
    const stat = adminStatMap.get(a.user_id);
    if (!stat) continue;
    stat.added += 1;
    if (a.status === "Available") stat.available += 1;
    if (a.status === "Sold" && inPeriod(a)) {
      stat.sold += 1;
      stat.revenue += Number(a.selling_price);
      stat.cost += Number(a.purchase_price);
      stat.profit += Number(a.selling_price) - Number(a.purchase_price);
    }
  }

  const allAdminStats = Array.from(adminStatMap.values()).sort(
    (a, b) => b.profit - a.profit,
  );

  const filteredAdminStats =
    selectedAdminIds.size > 0
      ? allAdminStats.filter((s) => selectedAdminIds.has(s.id))
      : allAdminStats;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Doanh Thu Toàn Shop</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tổng quan doanh thu của tất cả tài khoản trên hệ thống
          </p>
        </div>
        <DashboardPeriodFilter />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Tổng Tài Khoản Shop"
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

      {/* ── Revenue trend chart ── */}
      <div className="mt-6">
        <RevenueTrendChart
          data={[...displayStats].reverse().map((s) => ({
            date: s.dateStr,
            sold: s.sold,
            profit: s.profit,
          }))}
          periodLabel={periodLabel}
        />
      </div>

      {/* ── Per-admin section ── */}
      <AdminRevenueFilter admins={adminOptions} />

      {/* Desktop table */}
      <div className="mt-4 hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm sm:block">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            <TableRow>
              <TableHead className="px-4 py-3">Admin</TableHead>
              <TableHead className="px-4 py-3 text-center">Đã Thêm</TableHead>
              <TableHead className="px-4 py-3 text-center">Sẵn Sàng</TableHead>
              <TableHead className="px-4 py-3 text-center">Đã Bán{periodLabel}</TableHead>
              <TableHead className="hidden px-4 py-3 text-right lg:table-cell">Doanh Thu{periodLabel}</TableHead>
              <TableHead className="hidden px-4 py-3 text-right lg:table-cell">Chi Phí{periodLabel}</TableHead>
              <TableHead className="px-4 py-3 text-right">Lợi Nhuận{periodLabel}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdminStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredAdminStats.map((s) => (
                <TableRow key={s.id} className="text-slate-700 dark:text-slate-200">
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                        {(s.name || s.email)[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 max-w-[180px]">
                        {s.name && <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{s.name}</p>}
                        <p className="truncate text-xs text-slate-400 dark:text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center font-semibold text-indigo-600 dark:text-indigo-400">{s.added}</TableCell>
                  <TableCell className="px-4 py-3 text-center font-semibold text-amber-600">{s.available}</TableCell>
                  <TableCell className="px-4 py-3 text-center font-semibold text-emerald-600">{s.sold}</TableCell>
                  <TableCell className="hidden px-4 py-3 text-right text-slate-700 dark:text-slate-200 lg:table-cell">{formatCurrency(s.revenue)}</TableCell>
                  <TableCell className="hidden px-4 py-3 text-right text-slate-700 dark:text-slate-200 lg:table-cell">{formatCurrency(s.cost)}</TableCell>
                  <TableCell className={`px-4 py-3 text-right font-semibold ${s.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {formatCurrency(s.profit)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile admin revenue cards */}
      <div className="mt-4 flex flex-col gap-3 sm:hidden">
        {filteredAdminStats.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Không có dữ liệu</p>
        ) : (
          filteredAdminStats.map((s) => (
            <Card key={s.id} size="sm">
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-sm font-bold text-indigo-700 dark:text-indigo-400">
                    {(s.name || s.email)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    {s.name && <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{s.name}</p>}
                    <p className="truncate text-xs text-slate-400 dark:text-slate-500">{s.email}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 px-2 py-1.5">
                    <p className="text-slate-500 dark:text-slate-400">Thêm</p>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">{s.added}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 px-2 py-1.5">
                    <p className="text-slate-500 dark:text-slate-400">Sẵn sàng</p>
                    <p className="font-semibold text-amber-600">{s.available}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 px-2 py-1.5">
                    <p className="text-slate-500 dark:text-slate-400">Đã bán</p>
                    <p className="font-semibold text-emerald-600">{s.sold}</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Doanh thu{periodLabel}:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(s.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Chi phí:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(s.cost)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Lợi nhuận:</span>
                    <span className={`font-semibold ${s.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>{formatCurrency(s.profit)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Daily breakdown ── */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Chi tiết doanh thu theo ngày{periodLabel}
        </h2>
        {/* Desktop daily table */}
        <div className="mt-4 hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm sm:block">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              <TableRow>
                <TableHead className="px-4 py-3">Ngày</TableHead>
                <TableHead className="px-4 py-3 text-center">Đã Thêm</TableHead>
                <TableHead className="px-4 py-3 text-center">Sẵn Sàng</TableHead>
                <TableHead className="px-4 py-3 text-center">Đã Bán</TableHead>
                <TableHead className="px-4 py-3 text-right">Lợi Nhuận</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    Không có dữ liệu trong khoảng thời gian này
                  </TableCell>
                </TableRow>
              ) : (
                displayStats.map((stat) => (
                  <TableRow key={stat.dateStr} className="text-slate-700 dark:text-slate-200">
                    <TableCell className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {stat.dateStr.split("-").reverse().join("/")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center text-indigo-600 dark:text-indigo-400 font-semibold">{stat.added}</TableCell>
                    <TableCell className="px-4 py-3 text-center text-amber-600 font-semibold">{stat.available}</TableCell>
                    <TableCell className="px-4 py-3 text-center text-emerald-600 font-semibold">{stat.sold}</TableCell>
                    <TableCell className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(stat.profit)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile daily cards */}
        <div className="mt-4 flex flex-col gap-2 sm:hidden">
          {displayStats.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Không có dữ liệu trong khoảng thời gian này</p>
          ) : (
            displayStats.map((stat) => (
              <Card key={stat.dateStr} size="sm">
                <CardContent className="flex items-center justify-between gap-3 py-0">
                  <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                    {stat.dateStr.split("-").reverse().join("/")}
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex flex-col items-center">
                      <span className="text-slate-400 dark:text-slate-500">Thêm</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{stat.added}</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="text-slate-400 dark:text-slate-500">Còn</span>
                      <span className="font-semibold text-amber-600">{stat.available}</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="text-slate-400 dark:text-slate-500">Bán</span>
                      <span className="font-semibold text-emerald-600">{stat.sold}</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="text-slate-400 dark:text-slate-500">Lợi nhuận</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(stat.profit)}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
