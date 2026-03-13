import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin, SUPER_ADMIN_EMAIL } from "@/lib/super-admin";
import { redirect } from "next/navigation";
import { Users, ShieldCheck, Gamepad2, Mail, Calendar, Clock } from "lucide-react";
import { CreateAdminModal } from "./CreateAdminModal";
import { DeleteAdminButton } from "./DeleteAdminButton";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { EditAdminNameModal } from "./EditAdminNameModal";
import { AutoApproveToggle } from "./AutoApproveToggle";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { AdminSettings } from "@/types/database";

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtDateTime(d: string | null) {
  if (!d) return "Chưa đăng nhập";
  return new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function SuperAdminsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !checkIsSuperAdmin(user.email)) redirect("/admin/dashboard");

  const service = createSupabaseServiceClient();

  const { data: usersData } = await service.auth.admin.listUsers({ perPage: 1000 });
  const allUsers = usersData?.users ?? [];

  const [
    { data: accountRows },
    { data: emailRows },
    { data: settingsRows },
  ] = await Promise.all([
    service.from("accounts").select("user_id"),
    service.from("emails").select("user_id"),
    service.from("admin_settings").select("user_id, auto_approve"),
  ]);

  const acctCount = new Map<string, number>();
  for (const r of accountRows ?? []) acctCount.set(r.user_id, (acctCount.get(r.user_id) ?? 0) + 1);

  const emailCount = new Map<string, number>();
  for (const r of emailRows ?? []) emailCount.set(r.user_id, (emailCount.get(r.user_id) ?? 0) + 1);

  const autoApproveMap = new Map<string, boolean>(
    (settingsRows as AdminSettings[] ?? []).map((s) => [s.user_id, s.auto_approve])
  );

  const owner = allUsers.find((u) => u.email === SUPER_ADMIN_EMAIL);
  const admins = allUsers
    .filter((u) => u.email !== SUPER_ADMIN_EMAIL)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <Users className="h-4 w-4 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Quản Lý Admin</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {admins.length} admin · {(accountRows ?? []).length} tài khoản · {(emailRows ?? []).length} email
          </p>
        </div>
        <CreateAdminModal />
      </div>

      {owner && (
        <div className="mb-6 overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {owner.user_metadata?.full_name && (
                  <span className="text-sm font-bold text-slate-900 truncate">{owner.user_metadata.full_name}</span>
                )}
                <span className="text-sm font-semibold text-slate-500 truncate">{owner.email}</span>
                <span className="shrink-0 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">Owner</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Tạo: {fmtDate(owner.created_at)}</span>
                <span className="flex items-center gap-1"><Gamepad2 className="h-3 w-3" /> {acctCount.get(owner.id) ?? 0} tài khoản</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {emailCount.get(owner.id) ?? 0} email</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-700">Danh Sách Admin ({admins.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-slate-500">Admin</TableHead>
                <TableHead className="hidden text-slate-500 sm:table-cell">Tài Khoản</TableHead>
                <TableHead className="hidden text-slate-500 sm:table-cell">Email</TableHead>
                <TableHead className="hidden text-slate-500 md:table-cell">Ngày Tạo</TableHead>
                <TableHead className="hidden text-slate-500 lg:table-cell">Đăng Nhập Cuối</TableHead>
                <TableHead className="hidden text-slate-500 md:table-cell">Duyệt TK</TableHead>
                <TableHead className="text-slate-500">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                        {(admin.user_metadata?.full_name ?? admin.email ?? "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        {admin.user_metadata?.full_name ? (
                          <>
                            <p className="truncate text-sm font-semibold text-slate-900">{admin.user_metadata.full_name}</p>
                            <p className="max-w-[180px] truncate text-xs text-slate-400">{admin.email ?? "—"}</p>
                          </>
                        ) : (
                          <p className="max-w-[180px] truncate text-sm font-medium text-slate-900">{admin.email ?? "—"}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Gamepad2 className="h-3.5 w-3.5 text-indigo-400" /> {acctCount.get(admin.id) ?? 0}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Mail className="h-3.5 w-3.5 text-slate-400" /> {emailCount.get(admin.id) ?? 0}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-slate-500 md:table-cell">
                    <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> {fmtDate(admin.created_at)}</div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-slate-500 lg:table-cell">
                    <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400" /> {fmtDateTime(admin.last_sign_in_at ?? null)}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <AutoApproveToggle
                      adminId={admin.id}
                      adminEmail={admin.email ?? ""}
                      enabled={autoApproveMap.get(admin.id) ?? false}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <EditAdminNameModal adminId={admin.id} adminEmail={admin.email ?? ""} currentName={admin.user_metadata?.full_name ?? ""} />
                      <ResetPasswordModal adminId={admin.id} adminEmail={admin.email ?? ""} />
                      <DeleteAdminButton adminId={admin.id} adminEmail={admin.email ?? ""} accountCount={acctCount.get(admin.id) ?? 0} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    Chưa có admin nào. Nhấn "Thêm Admin" để tạo mới.
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
