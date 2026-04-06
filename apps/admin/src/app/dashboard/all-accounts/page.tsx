import type { Metadata } from "next";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { getAdminUsers } from "@/lib/cached-users";

export const revalidate = 120; // 2 minutes

export const metadata: Metadata = { title: "Tất Cả Tài Khoản" };
import { redirect } from "next/navigation";
import { Globe, Gamepad2, Star, ExternalLink } from "lucide-react";
import { StatusBadge } from "@thc-efb/ui/badge";
import { SuperAccountFilters } from "../super/accounts/SuperAccountFilters";
import { Suspense } from "react";
import Link from "next/link";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@thc-efb/ui/table";
import { Card, CardContent } from "@thc-efb/ui/card";
import type { AccountWithEmail } from "@thc-efb/supabase/types";
import { AccountDetailButton } from "./AccountDetailButton";
import { ACCOUNT_SELECT, applySortToQuery } from "@/lib/account-queries";

type SearchParams = { sort?: string; status?: string; q?: string };

export default async function AllAccountsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!checkIsSuperAdmin(user.email)) redirect("/dashboard");

  const params = await searchParams;
  const sort = params.sort ?? "newest";
  const statusFilter = params.status ?? "all";
  const searchQuery = params.q ?? "";

  const service = createSupabaseServiceClient();

  const allUsers = await getAdminUsers();
  const adminNameMap = new Map<string, string>(
    (allUsers ?? []).map((u) => [
      u.id,
      u.user_metadata?.full_name ?? u.email ?? u.id,
    ])
  );

  let query = service.from("accounts").select(ACCOUNT_SELECT);
  if (statusFilter && statusFilter !== "all") query = query.eq("status", statusFilter);
  if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);

  query = applySortToQuery(query, sort);

  const { data: accounts } = await query;
  const items = (accounts ?? []) as unknown as AccountWithEmail[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/10">
              <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tất Cả Tài Khoản</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Toàn bộ {items.length} tài khoản từ tất cả admin
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <Suspense fallback={null}>
          <SuperAccountFilters totalCount={items.length} />
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
                <TableHead className="text-slate-500 dark:text-slate-400">Admin</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((account) => {
                const adminName = adminNameMap.get(account.user_id) ?? account.user_id;
                return (
                  <TableRow key={account.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                          <Gamepad2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <Link
                          href={`https://thc-efb.com/accounts/${account.id}`}
                          target="_blank"
                          className="group flex items-center gap-1.5 truncate font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {account.is_priority && <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />}
                          <span className="truncate group-hover:underline">{account.title}</span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={account.status} />
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 w-fit">
                        {adminName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <AccountDetailButton account={account} adminName={adminName} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-slate-400 dark:text-slate-500">
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
        {items.map((account) => {
          const adminName = adminNameMap.get(account.user_id) ?? account.user_id;
          return (
            <Card key={account.id} size="sm">
              <CardContent>
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`https://thc-efb.com/accounts/${account.id}`}
                    target="_blank"
                    className="group inline-flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {account.is_priority && <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />}
                    <span className="group-hover:underline">{account.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </Link>
                  <AccountDetailButton account={account} adminName={adminName} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={account.status} />
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400">
                    {adminName}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {items.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
            Không tìm thấy tài khoản nào phù hợp với bộ lọc.
          </p>
        )}
      </div>
    </div>
  );
}
