import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";
import { redirect } from "next/navigation";
import { Globe, Gamepad2, Star, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { SuperAccountFilters } from "../super/accounts/SuperAccountFilters";
import { Suspense } from "react";
import Link from "next/link";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { AccountWithEmail } from "@/types/database";
import { AccountDetailButton } from "./AccountDetailButton";

type SearchParams = { sort?: string; status?: string; q?: string };

export default async function AllAccountsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const isSuperAdmin = checkIsSuperAdmin(user.email);

  if (!isSuperAdmin) {
    const service = createSupabaseServiceClient();
    const { data: settings } = await service
      .from("admin_settings")
      .select("can_view_all_accounts")
      .eq("user_id", user.id)
      .single();

    if (!settings?.can_view_all_accounts) {
      redirect("/admin/dashboard");
    }
  }

  const params = await searchParams;
  const sort = params.sort ?? "newest";
  const statusFilter = params.status ?? "all";
  const searchQuery = params.q ?? "";

  const service = createSupabaseServiceClient();

  const { data: usersData } = await service.auth.admin.listUsers({ perPage: 1000 });
  const adminNameMap = new Map<string, string>(
    (usersData?.users ?? []).map((u) => [
      u.id,
      u.user_metadata?.full_name ?? u.email ?? u.id,
    ])
  );

  let query = service.from("accounts").select("*, emails(*)");
  if (statusFilter && statusFilter !== "all") query = query.eq("status", statusFilter);
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
              <Globe className="h-4 w-4 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Tất Cả Tài Khoản</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Toàn bộ {items.length} tài khoản từ tất cả admin
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Suspense fallback={null}>
          <SuperAccountFilters totalCount={items.length} />
        </Suspense>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-slate-500">Tài Khoản</TableHead>
                <TableHead className="text-slate-500">Trạng Thái</TableHead>
                <TableHead className="hidden text-slate-500 lg:table-cell">Admin</TableHead>
                <TableHead className="text-slate-500">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((account) => {
                const adminName = adminNameMap.get(account.user_id) ?? account.user_id;
                return (
                  <TableRow key={account.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 sm:flex">
                          <Gamepad2 className="h-4 w-4 text-indigo-600" />
                        </div>
                        <Link
                          href={`/accounts/${account.id}`}
                          target="_blank"
                          className="group flex items-center gap-1.5 max-w-[140px] sm:max-w-[220px] truncate font-medium text-slate-900 hover:text-indigo-600"
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
                    <TableCell className="hidden lg:table-cell">
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 w-fit">
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
                  <TableCell colSpan={4} className="py-12 text-center text-slate-400">
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
