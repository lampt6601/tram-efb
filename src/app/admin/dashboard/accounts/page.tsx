import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { Plus, Gamepad2, Star, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/constants";
import { AdminAccountFilters } from "./AdminAccountFilters";
import { AccountActionsDropdown } from "./AccountActionsDropdown";
import { Suspense } from "react";
import type { AccountWithEmail } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatCompactPrice(price: number): string {
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}tr`;
  }
  if (price >= 1_000) {
    return `${(price / 1_000).toFixed(price % 1_000 === 0 ? 0 : 1)}k`;
  }
  return price.toString();
}

type SearchParams = {
  sort?: string;
  status?: string;
  q?: string;
};

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const sort = params.sort ?? "newest";
  const statusFilter = params.status ?? "Available";
  const searchQuery = params.q ?? "";

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = user?.email ?? user?.id ?? "";

  let query = supabase.from("accounts").select("*, emails(*)");

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "price_asc":
      query = query.order("selling_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("selling_price", { ascending: false });
      break;
    case "purchase_asc":
      query = query.order("purchase_price", { ascending: true });
      break;
    case "purchase_desc":
      query = query.order("purchase_price", { ascending: false });
      break;
    case "gp_desc":
      query = query.order("total_gp", { ascending: false });
      break;
    case "strength_desc":
      query = query.order("team_strength", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: accounts } = await query;
  const items = (accounts ?? []) as AccountWithEmail[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tài Khoản</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} tài khoản game
          </p>
        </div>
        <Button
          render={<Link href="/admin/dashboard/accounts/new" />}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4" /> Thêm Tài Khoản
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Suspense fallback={null}>
          <AdminAccountFilters totalCount={items.length} />
        </Suspense>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-slate-500">Tài Khoản</TableHead>
                <TableHead className="text-slate-500">Trạng Thái</TableHead>
                <TableHead className="hidden text-slate-500 sm:table-cell">Phê Duyệt</TableHead>
                <TableHead className="hidden text-slate-500 md:table-cell">Giá Nhập</TableHead>
                <TableHead className="text-slate-500">Giá Bán</TableHead>
                <TableHead className="text-slate-500">Hành Động</TableHead>
                <TableHead className="text-slate-500">Email Liên Kết</TableHead>
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
                      <Link
                        href={`/accounts/${account.id}`}
                        target="_blank"
                        className="group flex items-center gap-1.5 max-w-[120px] truncate font-medium text-slate-900 hover:text-indigo-600 sm:max-w-none"
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
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {account.is_approved ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã duyệt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        <Clock className="h-3 w-3" />
                        Chờ duyệt
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-slate-600 md:table-cell">
                    {formatCurrency(account.purchase_price)}
                  </TableCell>
                  <TableCell className="font-medium text-indigo-600">
                    {account.original_price &&
                      account.original_price > account.selling_price && (
                        <div className="text-xs text-slate-400 line-through font-normal">
                          <span className="sm:hidden">
                            {formatCompactPrice(account.original_price)}
                          </span>
                          <span className="hidden sm:inline">
                            {formatCurrency(account.original_price)}
                          </span>
                        </div>
                      )}
                    <span className="sm:hidden">
                      {formatCompactPrice(account.selling_price)}
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
                  <TableCell className="max-w-[140px] truncate text-xs text-slate-500">
                    {account.emails?.email_address || "—"}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-slate-400"
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
