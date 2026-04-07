import type { Metadata } from "next";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin, SUPER_ADMIN_EMAIL } from "@thc-efb/shared/super-admin";
import { getAdminUsers } from "@/lib/cached-users";
import { redirect } from "next/navigation";
import { Users, ShieldCheck, Gamepad2, Mail, Calendar, Clock, Wallet, User } from "lucide-react";

export const revalidate = 0; // always fresh

export const metadata: Metadata = { title: "Quản Lý Admin" };
import { formatCurrency, formatDateVN, formatDateTimeVN } from "@thc-efb/shared/constants";
import { CreateAdminModal } from "./CreateAdminModal";
import { AutoApproveToggle } from "./AutoApproveToggle";
import { DisableAdminToggle } from "./DisableAdminToggle";
import { AdminActionsDropdown } from "./AdminActionsDropdown";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@thc-efb/ui/table";
import { Card, CardHeader, CardContent, CardAction, CardFooter } from "@thc-efb/ui/card";
import Image from "next/image";
import type { AdminSettings } from "@thc-efb/supabase/types";


export default async function SuperAdminsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !checkIsSuperAdmin(user.email)) redirect("/dashboard");

  const service = createSupabaseServiceClient();

  const allUsers = await getAdminUsers();

  const [
    { data: accountRows },
    { data: emailRows },
    { data: settingsRows },
  ] = await Promise.all([
    service.from("accounts").select("user_id"),
    service.from("emails").select("user_id"),
    service.from("admin_settings").select("user_id, auto_approve, is_disabled, collateral_amount, transaction_box_url, avatar_url, zalo_name"),
  ]);

  const acctCount = new Map<string, number>();
  for (const r of accountRows ?? []) acctCount.set(r.user_id, (acctCount.get(r.user_id) ?? 0) + 1);

  const emailCount = new Map<string, number>();
  for (const r of emailRows ?? []) emailCount.set(r.user_id, (emailCount.get(r.user_id) ?? 0) + 1);

  const autoApproveMap = new Map<string, boolean>(
    (settingsRows as AdminSettings[] ?? []).map((s) => [s.user_id, s.auto_approve])
  );
  const isDisabledMap = new Map<string, boolean>(
    (settingsRows as AdminSettings[] ?? []).map((s) => [s.user_id, s.is_disabled ?? false])
  );
  const collateralMap = new Map<string, number>(
    (settingsRows as AdminSettings[] ?? []).map((s) => [s.user_id, Number(s.collateral_amount) || 0])
  );
  const txBoxMap = new Map<string, string>(
    (settingsRows as AdminSettings[] ?? []).filter((s) => s.transaction_box_url).map((s) => [s.user_id, s.transaction_box_url!])
  );
  const avatarMap = new Map<string, string>(
    (settingsRows as AdminSettings[] ?? []).filter((s) => s.avatar_url).map((s) => [s.user_id, s.avatar_url!])
  );
  const zaloNameMap = new Map<string, string>(
    (settingsRows as AdminSettings[] ?? []).filter((s) => s.zalo_name).map((s) => [s.user_id, s.zalo_name!])
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
              <Users className="h-4 w-4 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quản Lý Admin</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {admins.length} admin · {(accountRows ?? []).length} tài khoản · {(emailRows ?? []).length} email
          </p>
        </div>
        <CreateAdminModal />
      </div>

      {owner && (
        <div className="mb-6 overflow-hidden rounded-xl border border-amber-200 dark:border-amber-500/20 bg-gradient-to-r from-amber-50 dark:from-amber-500/10 to-orange-50 dark:to-orange-500/10 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {owner.user_metadata?.full_name && (
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{owner.user_metadata.full_name}</span>
                )}
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">{owner.email}</span>
                <span className="shrink-0 rounded-full bg-amber-200 dark:bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300">Owner</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Tạo: {formatDateVN(owner.created_at)}</span>
                <span className="flex items-center gap-1"><Gamepad2 className="h-3 w-3" /> {acctCount.get(owner.id) ?? 0} tài khoản</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {emailCount.get(owner.id) ?? 0} email</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Danh Sách Admin ({admins.length})</h2>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto sm:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                <TableHead className="text-slate-500 dark:text-slate-400">Admin</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Tài Khoản</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Email</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 md:table-cell">Ngày Tạo</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 lg:table-cell">Đăng Nhập Cuối</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 md:table-cell">Duyệt TK</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 md:table-cell">Trạng Thái</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 lg:table-cell">Ký Quỹ</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {avatarMap.get(admin.id) ? (
                        <Image
                          src={avatarMap.get(admin.id)!}
                          alt={admin.user_metadata?.full_name ?? admin.email ?? ""}
                          width={32}
                          height={32}
                          className={`h-8 w-8 shrink-0 rounded-lg object-cover ${(isDisabledMap.get(admin.id) ?? false) ? "opacity-50 grayscale" : ""}`}
                        />
                      ) : (
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                          (isDisabledMap.get(admin.id) ?? false)
                            ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          {(admin.user_metadata?.full_name ?? admin.email ?? "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        {admin.user_metadata?.full_name ? (
                          <>
                            <p className={`truncate text-sm font-semibold ${
                              (isDisabledMap.get(admin.id) ?? false)
                                ? "text-slate-400 line-through dark:text-slate-500"
                                : "text-slate-900 dark:text-slate-100"
                            }`}>{admin.user_metadata.full_name}</p>
                            <p className="max-w-[180px] truncate text-xs text-slate-400 dark:text-slate-500">{admin.email ?? "—"}</p>
                          </>
                        ) : (
                          <p className={`max-w-[180px] truncate text-sm font-medium ${
                            (isDisabledMap.get(admin.id) ?? false)
                              ? "text-slate-400 line-through dark:text-slate-500"
                              : "text-slate-900 dark:text-slate-100"
                          }`}>{admin.email ?? "—"}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                      <Gamepad2 className="h-3.5 w-3.5 text-indigo-400" /> {acctCount.get(admin.id) ?? 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                      <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> {emailCount.get(admin.id) ?? 0}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-slate-500 dark:text-slate-400 md:table-cell">
                    <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> {formatDateVN(admin.created_at)}</div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-slate-500 dark:text-slate-400 lg:table-cell">
                    <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> {formatDateTimeVN(admin.last_sign_in_at ?? null)}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <AutoApproveToggle
                      adminId={admin.id}
                      adminEmail={admin.email ?? ""}
                      enabled={autoApproveMap.get(admin.id) ?? false}
                    />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <DisableAdminToggle
                      adminId={admin.id}
                      adminEmail={admin.email ?? ""}
                      disabled={isDisabledMap.get(admin.id) ?? false}
                    />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {(collateralMap.get(admin.id) ?? 0) > 0 ? (
                      <div className="flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-400">
                        <Wallet className="h-3.5 w-3.5" />
                        {formatCurrency(collateralMap.get(admin.id) ?? 0)}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">Chưa ký quỹ</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <AdminActionsDropdown
                      adminId={admin.id}
                      adminEmail={admin.email ?? ""}
                      currentName={admin.user_metadata?.full_name ?? ""}
                      currentZaloName={zaloNameMap.get(admin.id) ?? ""}
                      accountCount={acctCount.get(admin.id) ?? 0}
                      autoApprove={autoApproveMap.get(admin.id) ?? false}
                      isDisabled={isDisabledMap.get(admin.id) ?? false}
                      collateralAmount={collateralMap.get(admin.id) ?? 0}
                      transactionBoxUrl={txBoxMap.get(admin.id) ?? ""}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Chưa có admin nào. Nhấn &quot;Thêm Admin&quot; để tạo mới.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile card list */}
        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 sm:hidden">
          {admins.map((admin) => {
            const isDisabled = isDisabledMap.get(admin.id) ?? false;
            const collateral = collateralMap.get(admin.id) ?? 0;
            return (
              <Card key={admin.id} size="sm" className="rounded-none ring-0 shadow-none border-0 py-4">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    {avatarMap.get(admin.id) ? (
                      <Image
                        src={avatarMap.get(admin.id)!}
                        alt={admin.user_metadata?.full_name ?? admin.email ?? ""}
                        width={36}
                        height={36}
                        className={`h-9 w-9 shrink-0 rounded-lg object-cover ${isDisabled ? "opacity-50 grayscale" : ""}`}
                      />
                    ) : (
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                        isDisabled
                          ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}>
                        {(admin.user_metadata?.full_name ?? admin.email ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      {admin.user_metadata?.full_name ? (
                        <>
                          <p className={`text-sm font-semibold ${isDisabled ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-900 dark:text-slate-100"}`}>
                            {admin.user_metadata.full_name}
                          </p>
                          <p className="truncate text-xs text-slate-400 dark:text-slate-500">{admin.email ?? "—"}</p>
                        </>
                      ) : (
                        <p className={`text-sm font-medium ${isDisabled ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-900 dark:text-slate-100"}`}>
                          {admin.email ?? "—"}
                        </p>
                      )}
                    </div>
                  </div>
                  <CardAction>
                    <AdminActionsDropdown
                      adminId={admin.id}
                      adminEmail={admin.email ?? ""}
                      currentName={admin.user_metadata?.full_name ?? ""}
                      currentZaloName={zaloNameMap.get(admin.id) ?? ""}
                      accountCount={acctCount.get(admin.id) ?? 0}
                      autoApprove={autoApproveMap.get(admin.id) ?? false}
                      isDisabled={isDisabled}
                      collateralAmount={collateral}
                      transactionBoxUrl={txBoxMap.get(admin.id) ?? ""}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent className="grid gap-y-2 text-sm">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Gamepad2 className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-slate-700 dark:text-slate-300">{acctCount.get(admin.id) ?? 0} tài khoản</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      <span className="text-slate-700 dark:text-slate-300">{emailCount.get(admin.id) ?? 0} email</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Tạo: {formatDateVN(admin.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Login: {formatDateTimeVN(admin.last_sign_in_at ?? null)}
                    </span>
                    {collateral > 0 && (
                      <span className="flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                        <Wallet className="h-3 w-3" /> {formatCurrency(collateral)}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Duyệt TK:</span>
                    <AutoApproveToggle
                      adminId={admin.id}
                      adminEmail={admin.email ?? ""}
                      enabled={autoApproveMap.get(admin.id) ?? false}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Trạng thái:</span>
                    <DisableAdminToggle
                      adminId={admin.id}
                      adminEmail={admin.email ?? ""}
                      disabled={isDisabled}
                    />
                  </div>
                </CardFooter>
              </Card>
            );
          })}
          {admins.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
              Chưa có admin nào. Nhấn &quot;Thêm Admin&quot; để tạo mới.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
