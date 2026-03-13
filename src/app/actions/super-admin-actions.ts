"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";
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

async function getSuperAdminId(): Promise<string> {
  const service = createSupabaseServiceClient();
  const { data } = await service.auth.admin.listUsers({ perPage: 1000 });
  const owner = (data?.users ?? []).find(
    (u) => u.email === "tranhuucanh2000@gmail.com"
  );
  if (!owner) throw new Error("Super admin user not found");
  return owner.id;
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
  const { error } = await service
    .from("accounts")
    .update({ ...payload, user_id: originalUserId })
    .eq("id", accountId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/super/accounts");
  revalidatePath(`/admin/dashboard/super/accounts/${accountId}/edit`);
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

  // Transfer all accounts and emails to the super admin before deleting
  const ownerId = await getSuperAdminId();

  const { error: e1 } = await service
    .from("accounts")
    .update({ user_id: ownerId })
    .eq("user_id", adminId);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await service
    .from("emails")
    .update({ user_id: ownerId })
    .eq("user_id", adminId);
  if (e2) throw new Error(e2.message);

  const { error } = await service.auth.admin.deleteUser(adminId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard/super/admins");
}

export async function resetAdminPassword(adminId: string, newPassword: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service.auth.admin.updateUserById(adminId, {
    password: newPassword,
  });
  if (error) throw new Error(error.message);
}
