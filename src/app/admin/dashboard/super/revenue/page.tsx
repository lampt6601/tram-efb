import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/constants";
import { StatCard } from "@/components/ui/StatCard";
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
import type { Account } from "@/types/database";

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
    redirect("/admin/dashboard");
  }

  // Use service client to bypass RLS and get all shop data
  const service = createSupabaseServiceClient();
  const [{ data: accounts }, { data: usersData }] = await Promise.all([
    service.from("accounts").select("*"),
    service.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const items = (accounts ?? []) as Account[];
  const allUsers = usersData?.users ?? [];

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
          <h1 className="text-2xl font-bold text-slate-900">Doanh Thu Toàn Shop</h1>
          <p className="mt-1 text-sm text-slate-500">
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

      {/* ── Per-admin section ── */}
      <AdminRevenueFilter admins={adminOptions} />

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3 text-center">Acc Đã Thêm</th>
              <th className="px-4 py-3 text-center">Acc Sẵn Sàng</th>
              <th className="hidden px-4 py-3 text-center sm:table-cell">Acc Đã Bán{periodLabel}</th>
              <th className="hidden px-4 py-3 text-right md:table-cell">Doanh Thu{periodLabel}</th>
              <th className="hidden px-4 py-3 text-right md:table-cell">Chi Phí{periodLabel}</th>
              <th className="px-4 py-3 text-right">Lợi Nhuận{periodLabel}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdminStats.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredAdminStats.map((s) => (
                <tr key={s.id} className="border-t last:border-b text-slate-700 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                        {(s.name || s.email)[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        {s.name && <p className="truncate text-sm font-semibold text-slate-900">{s.name}</p>}
                        <p className="truncate text-xs text-slate-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-indigo-600">{s.added}</td>
                  <td className="px-4 py-3 text-center font-semibold text-amber-600">{s.available}</td>
                  <td className="hidden px-4 py-3 text-center font-semibold text-emerald-600 sm:table-cell">{s.sold}</td>
                  <td className="hidden px-4 py-3 text-right text-slate-700 md:table-cell">{formatCurrency(s.revenue)}</td>
                  <td className="hidden px-4 py-3 text-right text-slate-700 md:table-cell">{formatCurrency(s.cost)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${s.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {formatCurrency(s.profit)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Daily breakdown ── */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Chi tiết doanh thu theo ngày{periodLabel}
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3 text-center">Acc Đã Thêm</th>
                <th className="px-4 py-3 text-center">Acc Sẵn Sàng</th>
                <th className="px-4 py-3 text-center">Acc Đã Bán</th>
                <th className="px-4 py-3 text-right">Lợi Nhuận</th>
              </tr>
            </thead>
            <tbody>
              {displayStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Không có dữ liệu trong khoảng thời gian này
                  </td>
                </tr>
              ) : (
                displayStats.map((stat) => (
                  <tr key={stat.dateStr} className="border-t last:border-b text-slate-700 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {stat.dateStr.split("-").reverse().join("/")}
                    </td>
                    <td className="px-4 py-3 text-center text-indigo-600 font-semibold">{stat.added}</td>
                    <td className="px-4 py-3 text-center text-amber-600 font-semibold">{stat.available}</td>
                    <td className="px-4 py-3 text-center text-emerald-600 font-semibold">{stat.sold}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(stat.profit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
