import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe, Gamepad2, Star, Pencil } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/constants";
import { SuperAccountFilters } from "./SuperAccountFilters";
import { SuperAccountDeleteButton } from "./SuperAccountDeleteButton";
import { UnapproveButton } from "./UnapproveButton";
import { Suspense } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { AccountWithEmail } from "@/types/database";

type SearchParams = { sort?: string; status?: string; q?: string };

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
  const statusFilter = params.status ?? "all";
  const searchQuery = params.q ?? "";

  const service = createSupabaseServiceClient();

  // Build admin email map from all users
  const { data: usersData } = await service.auth.admin.listUsers({ perPage: 1000 });
  const adminEmailMap = new Map<string, string>(
    (usersData?.users ?? []).map((u) => [u.id, u.email ?? u.id])
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <Globe className="h-4 w-4 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Tất Cả Tài Khoản</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Toàn bộ {items.length} tài khoản từ tất cả admin
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
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
                <TableHead className="hidden text-slate-500 md:table-cell">Giá Nhập</TableHead>
                <TableHead className="text-slate-500">Giá Bán</TableHead>
                <TableHead className="hidden text-slate-500 lg:table-cell">Admin</TableHead>
                <TableHead className="hidden text-slate-500 lg:table-cell">Email Liên Kết</TableHead>
                <TableHead className="text-slate-500">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((account) => (
                <TableRow key={account.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 sm:flex">
                        <Gamepad2 className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="flex items-center gap-1.5 max-w-[120px] truncate font-medium text-slate-900 sm:max-w-none">
                        {account.is_priority && <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />}
                        <span className="truncate">{account.title}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={account.status} /></TableCell>
                  <TableCell className="hidden text-slate-600 md:table-cell">
                    {formatCurrency(account.purchase_price)}
                  </TableCell>
                  <TableCell className="font-medium text-indigo-600">
                    {account.original_price && account.original_price > account.selling_price && (
                      <div className="text-xs text-slate-400 line-through font-normal">
                        <span className="sm:hidden">{compactPrice(account.original_price)}</span>
                        <span className="hidden sm:inline">{formatCurrency(account.original_price)}</span>
                      </div>
                    )}
                    <span className="sm:hidden">{compactPrice(account.selling_price)}</span>
                    <span className="hidden sm:inline">{formatCurrency(account.selling_price)}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {adminEmailMap.get(account.user_id) ?? account.user_id}
                    </span>
                  </TableCell>
                  <TableCell className="hidden max-w-[140px] truncate text-xs text-slate-500 lg:table-cell">
                    {account.emails?.email_address || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={`/admin/dashboard/super/accounts/${account.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Sửa
                      </Link>
                      {account.is_approved && account.status !== "Sold" && (
                        <UnapproveButton accountId={account.id} accountTitle={account.title} />
                      )}
                      <SuperAccountDeleteButton id={account.id} title={account.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
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
