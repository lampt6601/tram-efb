import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { Plus, Pencil, Gamepad2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/constants";
import { DeleteAccountButton } from "./DeleteButton";
import { SellAccountButton } from "./SellButton";
import { AdminAccountFilters } from "./AdminAccountFilters";
import { CopyLinkButton } from "./CopyLinkButton";
import { Suspense } from "react";
import type { AccountWithEmail } from "@/types/database";

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

  let query = supabase.from("accounts").select("*, emails(*)");

  // Filter by status
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  // Filter by search query (title)
  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  // Sort
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
        <Link
          href="/admin/dashboard/accounts/new"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Thêm Tài Khoản
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Suspense fallback={null}>
          <AdminAccountFilters totalCount={items.length} />
        </Suspense>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 font-medium text-slate-500">
                  Tài Khoản
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 font-medium text-slate-500">
                  Trạng Thái
                </th>
                <th className="hidden px-3 py-2 sm:px-6 sm:py-3 font-medium text-slate-500 md:table-cell">
                  Giá Nhập
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 font-medium text-slate-500">
                  Giá Bán
                </th>
                <th className="hidden px-3 py-2 sm:px-6 sm:py-3 font-medium text-slate-500 md:table-cell">
                  Lực Chiến
                </th>
                <th className="hidden px-3 py-2 sm:px-6 sm:py-3 font-medium text-slate-500 lg:table-cell">
                  Email Liên Kết
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 font-medium text-slate-500">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((account) => (
                <tr key={account.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 sm:flex">
                        <Gamepad2 className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="max-w-[120px] truncate font-medium text-slate-900 sm:max-w-none">
                        {account.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <StatusBadge status={account.status} />
                  </td>
                  <td className="hidden px-3 py-3 sm:px-6 sm:py-4 text-slate-600 md:table-cell">
                    {formatCurrency(account.purchase_price)}
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 font-medium text-indigo-600">
                    <span className="sm:hidden">
                      {formatCompactPrice(account.selling_price)}
                    </span>
                    <span className="hidden sm:inline">
                      {formatCurrency(account.selling_price)}
                    </span>
                  </td>
                  <td className="hidden px-3 py-3 sm:px-6 sm:py-4 text-slate-600 md:table-cell">
                    {account.team_strength}
                  </td>
                  <td className="hidden px-3 py-3 sm:px-6 sm:py-4 text-xs text-slate-500 lg:table-cell">
                    {account.emails?.email_address || "—"}
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Link
                        href={`/admin/dashboard/accounts/${account.id}/edit`}
                        className="rounded-lg p-1.5 sm:p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <CopyLinkButton id={account.id} />
                      <SellAccountButton
                        id={account.id}
                        currentSellingPrice={account.selling_price}
                        status={account.status}
                      />
                      <DeleteAccountButton id={account.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Không tìm thấy tài khoản nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
