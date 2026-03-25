import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";
import { redirect } from "next/navigation";
import { Globe, Gamepad2, Star, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/constants";
import { SuperAccountFilters } from "./SuperAccountFilters";
import { SuperAccountActionsDropdown } from "./SuperAccountActionsDropdown";
import { Suspense } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import type { AccountWithEmail } from "@/types/database";
import { SUPER_ADMIN_EMAIL } from "@/lib/super-admin";

type SearchParams = { sort?: string; status?: string; approval?: string; q?: string };

function compactPrice(price: number): string {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}tr`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(price % 1_000 === 0 ? 0 : 1)}k`;
  return price.toString();
}

export default async function SuperAccountsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !checkIsSuperAdmin(user.email)) redirect("/admin/dashboard");

  const params = await searchParams;
  const sort = params.sort ?? "newest";
  const statusFilter = params.status ?? "Available";
  const approvalFilter = params.approval ?? "all";
  const searchQuery = params.q ?? "";

  const service = createSupabaseServiceClient();

  // Build admin email map from all users
  const { data: usersData } = await service.auth.admin.listUsers({ perPage: 1000 });
  const adminOptions = (usersData?.users ?? [])
    .filter((u) => !!u.email && u.email !== SUPER_ADMIN_EMAIL)
    .map((u) => ({
      id: u.id,
      label: u.user_metadata?.full_name
        ? `${u.user_metadata.full_name} (${u.email})`
        : (u.email as string),
    }));
  const adminEmailMap = new Map<string, string>(
    (usersData?.users ?? []).map((u) => [u.id, u.email ?? u.id])
  );

  let query = service.from("accounts").select("*, emails(*)");
  if (statusFilter && statusFilter !== "all") query = query.eq("status", statusFilter);
  if (approvalFilter === "pending") {
    query = query.eq("is_approved", false).neq("status", "Sold");
  }
  if (approvalFilter === "approved") query = query.eq("is_approved", true);
  if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);

  switch (sort) {
    case "oldest": query = query.order("created_at", { ascending: true }); break;
    case "price_asc": query = query.order("selling_price", { ascending: true }); break;
    case "price_desc": query = query.order("selling_price", { ascending: false }); break;
    case "gp_desc": query = query.order("total_gp", { ascending: false }); break;
    case "strength_desc": query = query.order("team_strength", { ascending: false }); break;
    default: query = query.order("created_at", { ascending: false });
  }

  const { data: accounts } = await query;
  const items = (accounts ?? []) as AccountWithEmail[];
  const pendingApprovalCount = items.filter(
    (a) => !a.is_approved && a.status !== "Sold",
  ).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
              <Globe className="h-4 w-4 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tất Cả Tài Khoản</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Toàn bộ {items.length} tài khoản từ tất cả admin
          </p>
          <p className="mt-0.5 text-xs text-amber-600">
            {pendingApprovalCount} tài khoản đang chờ duyệt
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-amber-100 dark:border-amber-500/20 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <Suspense fallback={null}>
          <SuperAccountFilters totalCount={items.length} />
        </Suspense>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                <TableHead className="text-slate-500 dark:text-slate-400">Tài Khoản</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Trạng Thái</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 sm:table-cell">Phê Duyệt</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 md:table-cell">Giá Nhập</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Giá Bán</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 lg:table-cell">Admin</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 lg:table-cell">Email Liên Kết</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((account) => (
                <TableRow key={account.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 sm:flex">
                        <Gamepad2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <Link
                        href={`/accounts/${account.id}`}
                        target="_blank"
                        className="group flex items-center gap-1.5 max-w-[120px] truncate font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 sm:max-w-none"
                      >
                        {account.is_priority && <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />}
                        <span className="truncate group-hover:underline">{account.title}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={account.status} /></TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {account.is_approved ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        Đã duyệt
                      </span>
                    ) : account.status === "Sold" ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                        Không cần duyệt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        Chờ duyệt
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-slate-600 dark:text-slate-300 md:table-cell">
                    {formatCurrency(account.purchase_price)}
                  </TableCell>
                  <TableCell className="font-medium text-indigo-600 dark:text-indigo-400">
                    {account.original_price && account.original_price > account.selling_price && (
                      <div className="text-xs text-slate-400 dark:text-slate-500 line-through font-normal">
                        <span className="sm:hidden">{compactPrice(account.original_price)}</span>
                        <span className="hidden sm:inline">{formatCurrency(account.original_price)}</span>
                      </div>
                    )}
                    <span className="sm:hidden">{compactPrice(account.selling_price)}</span>
                    <span className="hidden sm:inline">{formatCurrency(account.selling_price)}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
                      {adminEmailMap.get(account.user_id) ?? account.user_id}
                    </span>
                  </TableCell>
                  <TableCell className="hidden max-w-[140px] truncate text-xs text-slate-500 dark:text-slate-400 lg:table-cell">
                    {account.emails?.email_address || "—"}
                  </TableCell>
                  <TableCell>
                    <SuperAccountActionsDropdown
                      account={account}
                      adminEmail={adminEmailMap.get(account.user_id) ?? account.user_id}
                      adminOptions={adminOptions}
                      isApproved={account.is_approved}
                      isSold={account.status === "Sold"}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Không tìm thấy tài khoản nào phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
