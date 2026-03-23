"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";
import { assertAvailablePriorityLimit } from "@/lib/account-priority";
import { revalidatePath } from "next/cache";

async function verifySuperAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !checkIsSuperAdmin(user.email)) {
    throw new Error("Unauthorized: Super admin only");
  }
  return user;
}


export async function setAdminAutoApprove(adminId: string, autoApprove: boolean) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("admin_settings")
    .upsert({ user_id: adminId, auto_approve: autoApprove }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/super/admins");
}

export async function setAdminCanViewAllAccounts(adminId: string, canView: boolean) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("admin_settings")
    .upsert({ user_id: adminId, can_view_all_accounts: canView }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/super/admins");
}

export async function approveAccount(accountId: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("accounts")
    .update({ is_approved: true })
    .eq("id", accountId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/super/pending");
  revalidatePath("/admin/dashboard/super/accounts");
}

export async function unapproveAccount(accountId: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("accounts")
    .update({ is_approved: false })
    .eq("id", accountId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/super/pending");
  revalidatePath("/admin/dashboard/super/accounts");
  revalidatePath("/admin/dashboard/accounts");
}

export async function superAdminDeleteAccount(accountId: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service.from("accounts").delete().eq("id", accountId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/super/accounts");
}

export async function superAdminUpdateAccount(
  accountId: string,
  originalUserId: string,
  payload: Record<string, unknown>
) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  const { data: current, error: fetchErr } = await service
    .from("accounts")
    .select("user_id, status, is_priority")
    .eq("id", accountId)
    .single();

  if (fetchErr || !current) {
    throw new Error(fetchErr?.message ?? "Không tìm thấy tài khoản");
  }

  await assertAvailablePriorityLimit(service, accountId, current, payload);

  const { error } = await service
    .from("accounts")
    .update({ ...payload, user_id: originalUserId })
    .eq("id", accountId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/super/accounts");
  revalidatePath(`/admin/dashboard/super/accounts/${accountId}/edit`);
  revalidatePath("/admin/dashboard/accounts");
}

export async function copyAccountToAdmin(accountId: string, targetAdminId: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  const { data: source, error: sourceErr } = await service
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .single();

  if (sourceErr || !source) throw new Error(sourceErr?.message ?? "Không tìm thấy tài khoản nguồn");

  const copyPayload = {
    title: source.title,
    purchase_price: source.purchase_price,
    selling_price: source.selling_price,
    original_price: source.original_price,
    images: source.images,
    primary_image_url: source.primary_image_url,
    status: "Available",
    total_gp: source.total_gp,
    total_coins_android: source.total_coins_android,
    total_coins_ios: source.total_coins_ios,
    team_strength: source.team_strength,
    server_region: source.server_region,
    monthly_log_quota: source.monthly_log_quota,
    email_id: null, // Email là dữ liệu riêng theo admin, không copy liên kết cũ
    user_id: targetAdminId,
    is_priority: false,
    is_clone: source.is_clone ?? false,
    is_approved: false,
  };

  const { error: insertErr } = await service.from("accounts").insert(copyPayload);
  if (insertErr) throw new Error(insertErr.message);

  revalidatePath("/admin/dashboard/super/accounts");
  revalidatePath("/admin/dashboard/super/pending");
  revalidatePath("/admin/dashboard/accounts");
}

export async function createAdmin(email: string, password: string, name?: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { full_name: name } : undefined,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/super/admins");
  return data.user;
}

export async function updateAdminProfile(adminId: string, name: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service.auth.admin.updateUserById(adminId, {
    user_metadata: { full_name: name },
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/super/admins");
}

export async function deleteAdmin(adminId: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  // Unassign accounts and emails (set user_id = null) before deleting admin.
  // The FK ON DELETE SET NULL would handle this automatically, but we do it
  // explicitly to also unapprove orphaned accounts.
  const { error: e1 } = await service
    .from("accounts")
    .update({ user_id: null, is_approved: false })
    .eq("user_id", adminId);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await service
    .from("emails")
    .update({ user_id: null })
    .eq("user_id", adminId);
  if (e2) throw new Error(e2.message);

  const { error } = await service.auth.admin.deleteUser(adminId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard/super/admins");
  revalidatePath("/admin/dashboard/super/accounts");
  revalidatePath("/");
}

export async function resetAdminPassword(adminId: string, newPassword: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service.auth.admin.updateUserById(adminId, {
    password: newPassword,
  });
  if (error) throw new Error(error.message);
}
