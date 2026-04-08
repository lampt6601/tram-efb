import type { Metadata } from "next";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { getAdminUsers } from "@/lib/cached-users";
import { redirect } from "next/navigation";
import { Globe, Gamepad2, Star, ExternalLink, XCircle } from "lucide-react";

export const revalidate = 60; // 1 minute — revalidated on mutations via revalidatePath

export const metadata: Metadata = { title: "Tất Cả Tài Khoản (Super)" };
import { StatusBadge } from "@thc-efb/ui/badge";
import { formatCurrency, formatCompactPriceVN } from "@thc-efb/shared/constants";
import { ACCOUNT_SELECT, applySortToQuery } from "@/lib/account-queries";
import { SuperAccountFilters } from "./SuperAccountFilters";
import { SuperAccountActionsDropdown } from "./SuperAccountActionsDropdown";
import { AccountDetailOpener } from "@/components/admin/AccountDetailOpener";
import { Suspense } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@thc-efb/ui/table";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@thc-efb/ui/card";
import { CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import type { AccountWithEmail, Email } from "@thc-efb/supabase/types";
import { SUPER_ADMIN_EMAIL } from "@thc-efb/shared/super-admin";

type SearchParams = {
  sort?: string;
  status?: string;
  q?: string;
  detail?: string;
  admin?: string;
  minPrice?: string;
  maxPrice?: string;
};


export default async function SuperAccountsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !checkIsSuperAdmin(user.email)) redirect("/dashboard");

  const params = await searchParams;
  const sort = params.sort ?? "newest";
  const detailAccountId = params.detail ?? null;
  // When deep-linking to a specific account, show all statuses so the account is always findable
  const statusFilter = detailAccountId ? (params.status ?? "all") : (params.status ?? "Available");
  const searchQuery = params.q ?? "";
  const adminFilter = params.admin ?? "all";
  const minPrice = params.minPrice ? Number(params.minPrice) : null;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : null;
  const hasValidMinPrice = minPrice !== null && Number.isFinite(minPrice) && minPrice >= 0;
  const hasValidMaxPrice = maxPrice !== null && Number.isFinite(maxPrice) && maxPrice >= 0;

  const service = createSupabaseServiceClient();

  // Build admin email map from all users (cached, fast)
  const allUsers = await getAdminUsers();
  const adminEmailMap = new Map<string, string>(
    (allUsers ?? []).map((u) => [u.id, u.user_metadata?.full_name ?? u.email ?? u.id])
  );
  const adminOptions = (allUsers ?? []).map((u) => ({
    id: u.id,
    name: u.user_metadata?.full_name ?? u.email ?? u.id,
  }));

  // Fast path: deep-link from notification — only fetch the single account,
  // skip the full list + emails queries. The list loads after the dialog is closed (URL param removed).
  if (detailAccountId) {
    const { data: singleAccount } = await service
      .from("accounts")
      .select(ACCOUNT_SELECT)
      .eq("id", detailAccountId)
      .single();

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
          </div>
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm" />
        {singleAccount && (
          <Suspense fallback={null}>
            <AccountDetailOpener
              accountId={detailAccountId}
              accounts={[singleAccount as unknown as AccountWithEmail]}
              adminNameMap={Object.fromEntries(adminEmailMap)}
              showApproveButton
            />
          </Suspense>
        )}
      </div>
    );
  }

  // Fetch available emails for buyback (not linked to any account)
  const [{ data: allEmails }, { data: linkedAccounts }] = await Promise.all([
    service.from("emails").select("id, email_address, password, recovery_info, user_id, created_at, updated_at").order("email_address"),
    service.from("accounts").select("email_id").not("email_id", "is", null),
  ]);
  const linkedEmailIds = new Set(
    (linkedAccounts ?? []).map((a: { email_id: string }) => a.email_id)
  );
  const availableEmails = (allEmails ?? []).filter(
    (e: Email) => !linkedEmailIds.has(e.id) && e.user_id === user!.id
  ) as Email[];

  let query = service.from("accounts").select(ACCOUNT_SELECT);
  if (statusFilter && statusFilter !== "all") query = query.eq("status", statusFilter);
  if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);
  if (adminFilter && adminFilter !== "all") query = query.eq("user_id", adminFilter);
  if (hasValidMinPrice) query = query.gte("selling_price", minPrice);
  if (hasValidMaxPrice) query = query.lte("selling_price", maxPrice);

  query = applySortToQuery(query, sort);

  const { data: accounts } = await query;
  const items = (accounts ?? []) as unknown as AccountWithEmail[];
  const pendingApprovalCount = items.filter(
    (a) => !a.is_approved && !a.is_rejected && a.status !== "Sold",
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
          <SuperAccountFilters totalCount={items.length} admins={adminOptions} />
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
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                        <Gamepad2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <Link
                        href={`https://thc-efb.com/accounts/${account.id}`}
                        target="_blank"
                        className="group flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {account.is_priority && <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />}
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
                        Đã duyệt
                      </span>
                    ) : account.is_rejected ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400">
                        <XCircle className="h-3 w-3" />
                        Từ chối
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
                        {formatCurrency(account.original_price)}
                      </div>
                    )}
                    {formatCurrency(account.selling_price)}
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
                      isApproved={account.is_approved}
                      isSold={account.status === "Sold"}
                      availableEmails={availableEmails}
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
                  {account.is_priority && <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />}
                  <span className="group-hover:underline">{account.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                </Link>
              </CardTitle>
              <CardAction>
                <SuperAccountActionsDropdown
                  account={account}
                  adminEmail={adminEmailMap.get(account.user_id) ?? account.user_id}
                  isApproved={account.is_approved}
                  isSold={account.status === "Sold"}
                  availableEmails={availableEmails}
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
                ) : account.is_rejected ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400">
                    <XCircle className="h-3 w-3" />
                    Từ chối
                  </span>
                ) : account.status === "Sold" ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                    Không cần duyệt
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
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
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
                  {adminEmailMap.get(account.user_id) ?? account.user_id}
                </span>
                {account.emails?.email_address && (
                  <span className="truncate">{account.emails.email_address}</span>
                )}
              </div>
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
