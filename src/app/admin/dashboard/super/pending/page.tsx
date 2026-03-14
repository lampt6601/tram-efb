import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";
import { redirect } from "next/navigation";
import { ClipboardCheck, Gamepad2, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/Badge";
import { PendingActionsDropdown } from "./PendingActionsDropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AccountWithEmail } from "@/types/database";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function PendingApprovalPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !checkIsSuperAdmin(user.email)) redirect("/admin/dashboard");

  const service = createSupabaseServiceClient();

  const { data: usersData } = await service.auth.admin.listUsers({
    perPage: 1000,
  });
  const adminEmailMap = new Map<string, string>(
    (usersData?.users ?? []).map((u) => [u.id, u.email ?? u.id])
  );

  const { data: accounts } = await service
    .from("accounts")
    .select("*, emails(*)")
    .eq("is_approved", false)
    .order("created_at", { ascending: false });

  const items = (accounts ?? []) as AccountWithEmail[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <ClipboardCheck className="h-4 w-4 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Phê Duyệt Tài Khoản
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} tài khoản đang chờ phê duyệt
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20">
          <CheckCircle className="mb-4 h-12 w-12 text-emerald-300" />
          <h3 className="text-lg font-semibold text-slate-500">
            Không có tài khoản nào chờ duyệt
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Tất cả tài khoản đã được phê duyệt.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="text-slate-500">Tài Khoản</TableHead>
                  <TableHead className="text-slate-500">Trạng Thái</TableHead>
                  <TableHead className="hidden text-slate-500 md:table-cell">
                    Giá Bán
                  </TableHead>
                  <TableHead className="hidden text-slate-500 lg:table-cell">
                    Admin
                  </TableHead>
                  <TableHead className="hidden text-slate-500 md:table-cell">
                    Ngày Tạo
                  </TableHead>
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
                        <span className="max-w-[140px] truncate font-medium text-slate-900 sm:max-w-none">
                          {account.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={account.status} />
                    </TableCell>
                    <TableCell className="hidden font-medium text-indigo-600 md:table-cell">
                      {formatCurrency(account.selling_price)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {adminEmailMap.get(account.user_id) ?? account.user_id}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-sm text-slate-500 md:table-cell">
                      {fmtDate(account.created_at)}
                    </TableCell>
                    <TableCell>
                      <PendingActionsDropdown
                        account={account}
                        adminEmail={adminEmailMap.get(account.user_id) ?? account.user_id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
