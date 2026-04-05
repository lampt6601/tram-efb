import type { Metadata } from "next";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import Link from "next/link";

export const revalidate = 120; // 2 minutes

export const metadata: Metadata = { title: "Tài Khoản" };
import { Plus, Gamepad2, Star, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { StatusBadge } from "@thc-efb/ui/badge";
import { formatCurrency, formatCompactPriceVN } from "@thc-efb/shared/constants";
import { ACCOUNT_SELECT, applySortToQuery } from "@/lib/account-queries";
import { AdminAccountFilters } from "./AdminAccountFilters";
import { AccountActionsDropdown } from "./AccountActionsDropdown";
import { AccountDetailOpener } from "@/components/admin/AccountDetailOpener";
import { Suspense } from "react";
import type { AccountWithEmail } from "@thc-efb/supabase/types";
import { Button } from "@thc-efb/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@thc-efb/ui/table";


type SearchParams = {
  sort?: string;
  status?: string;
  q?: string;
  detail?: string;
};

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const sort = params.sort ?? "newest";
  const detailAccountId = params.detail ?? null;
  // When deep-linking to a specific account, show all statuses so the account is always findable
  const statusFilter = detailAccountId ? (params.status ?? "all") : (params.status ?? "Available");
  const searchQuery = params.q ?? "";

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = user?.user_metadata?.full_name ?? user?.email ?? user?.id ?? "";

  // Fast path: deep-link from notification — only fetch the single account,
  // skip the full list query. The list loads after the dialog is closed (URL param removed).
  if (detailAccountId) {
    const { data: singleAccount } = await supabase
      .from("accounts")
      .select(ACCOUNT_SELECT)
      .eq("id", detailAccountId)
      .single();

    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tài Khoản</h1>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/accounts/new" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4" /> Thêm Tài Khoản
          </Button>
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm" />
        {singleAccount && (
          <Suspense fallback={null}>
            <AccountDetailOpener
              accountId={detailAccountId}
              accounts={[singleAccount as unknown as AccountWithEmail]}
              adminName={adminEmail}
            />
          </Suspense>
        )}
      </div>
    );
  }

  let query = supabase.from("accounts").select(ACCOUNT_SELECT);

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  query = applySortToQuery(query, sort);

  const { data: accounts } = await query;
  const items = (accounts ?? []) as unknown as AccountWithEmail[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tài Khoản</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {items.length} tài khoản game
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/dashboard/accounts/new" />}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4" /> Thêm Tài Khoản
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <Suspense fallback={null}>
          <AdminAccountFilters totalCount={items.length} />
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
                <TableHead className="text-slate-500 dark:text-slate-400">Hành Động</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 sm:table-cell">Email Liên Kết</TableHead>
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
                        href={`https://thc-efb.com/accounts/${account.id}`}
                        target="_blank"
                        className="group flex items-center gap-1.5 max-w-[120px] truncate font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 sm:max-w-none"
                      >
                        {account.is_priority && (
                          <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500 inline" />
                        )}
                        <span className="truncate group-hover:underline">{account.title}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={account.status} />
                    {account.status === "Deposited" && account.deposit_customer_name && (
                      <div className="mt-1 text-[10px] leading-tight text-blue-600 dark:text-blue-400">
                        <span className="font-medium">{account.deposit_customer_name}</span>
                        {account.deposit_hold_until && (
                          <span className={new Date(account.deposit_hold_until) < new Date() ? " text-red-500" : ""}>
                            {" "}· đến {new Date(account.deposit_hold_until).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {account.is_approved ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã duyệt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        Chờ duyệt
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-slate-600 dark:text-slate-300 md:table-cell">
                    {formatCurrency(account.purchase_price)}
                  </TableCell>
                  <TableCell className="font-medium text-indigo-600 dark:text-indigo-400">
                    {account.original_price &&
                      account.original_price > account.selling_price && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 line-through font-normal">
                          <span className="sm:hidden">
                            {formatCompactPriceVN(account.original_price)}
                          </span>
                          <span className="hidden sm:inline">
                            {formatCurrency(account.original_price)}
                          </span>
                        </div>
                      )}
                    <span className="sm:hidden">
                      {formatCompactPriceVN(account.selling_price)}
                    </span>
                    <span className="hidden sm:inline">
                      {formatCurrency(account.selling_price)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <AccountActionsDropdown
                      id={account.id}
                      title={account.title}
                      purchasePrice={account.purchase_price}
                      currentSellingPrice={account.selling_price}
                      currentOriginalPrice={account.original_price ?? null}
                      status={account.status}
                      isClone={account.is_clone ?? false}
                      account={account}
                      adminEmail={adminEmail}
                    />
                  </TableCell>
                  <TableCell className="hidden max-w-[140px] truncate text-xs text-slate-500 dark:text-slate-400 sm:table-cell">
                    {account.emails?.email_address || "—"}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-slate-400 dark:text-slate-500"
                  >
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
