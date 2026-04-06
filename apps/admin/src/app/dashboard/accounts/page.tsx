import type { Metadata } from "next";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import Link from "next/link";

export const revalidate = 600; // 10 minutes

export const metadata: Metadata = { title: "Tài Khoản" };
import { Plus, Gamepad2, Star, Clock, CheckCircle2, ExternalLink, XCircle } from "lucide-react";
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
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@thc-efb/ui/card";


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

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm sm:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                <TableHead className="text-slate-500 dark:text-slate-400">Tài Khoản</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Trạng Thái</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Phê Duyệt</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 md:table-cell">Giá Nhập</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Giá Bán</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Hành Động</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Email Liên Kết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((account) => (
                <TableRow key={account.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                        <Gamepad2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <Link
                        href={`https://thc-efb.com/accounts/${account.id}`}
                        target="_blank"
                        className="group flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
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
                  <TableCell>
                    {account.is_approved ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã duyệt
                      </span>
                    ) : account.is_rejected ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400">
                        <XCircle className="h-3 w-3" />
                        Từ chối
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
                          {formatCurrency(account.original_price)}
                        </div>
                      )}
                    {formatCurrency(account.selling_price)}
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
                  <TableCell className="max-w-[140px] truncate text-xs text-slate-500 dark:text-slate-400">
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

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {items.map((account) => (
          <Card key={account.id} size="sm">
            <CardHeader>
              <CardTitle>
                <Link
                  href={`https://thc-efb.com/accounts/${account.id}`}
                  target="_blank"
                  className="group inline-flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {account.is_priority && (
                    <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />
                  )}
                  <span className="group-hover:underline">{account.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                </Link>
              </CardTitle>
              <CardAction>
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
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={account.status} />
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
              </div>
              {account.status === "Deposited" && account.deposit_customer_name && (
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  <span className="font-medium">{account.deposit_customer_name}</span>
                  {account.deposit_hold_until && (
                    <span className={new Date(account.deposit_hold_until) < new Date() ? " text-red-500" : ""}>
                      {" "}· đến {new Date(account.deposit_hold_until).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Giá nhập</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(account.purchase_price)}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Giá bán</span>
                  {account.original_price && account.original_price > account.selling_price && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-through">{formatCurrency(account.original_price)}</p>
                  )}
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(account.selling_price)}</p>
                </div>
              </div>
              {account.emails?.email_address && (
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Email: {account.emails.email_address}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
            Không tìm thấy tài khoản nào phù hợp với bộ lọc.
          </p>
        )}
      </div>

    </div>
  );
}
