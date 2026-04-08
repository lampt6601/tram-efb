"use server";

import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { assertAvailablePriorityLimit } from "@thc-efb/shared/account-priority";
import { revalidatePath } from "next/cache";
import { revalidateAccount, revalidateSeller, revalidateSiteSettings, revalidateWeb } from "@thc-efb/shared/revalidate-web";
import { reviewerApproveAccount, reviewerRejectAccount } from "./reviewer-actions";

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
  revalidatePath("/dashboard/super/admins");
}

export async function setAdminDisabled(adminId: string, disabled: boolean) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("admin_settings")
    .upsert({ user_id: adminId, is_disabled: disabled }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/super/admins");
}

export async function approveAccount(accountId: string) {
  await verifySuperAdmin();
  // Delegate to reviewer flow (handles notifications + reviewed_by/reviewed_at)
  await reviewerApproveAccount(accountId);
}

export async function unapproveAccount(accountId: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("accounts")
    .update({
      is_approved: false,
      is_rejected: false,
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
    })
    .eq("id", accountId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/super/pending");
  revalidatePath("/dashboard/super/accounts");
  revalidatePath("/dashboard/accounts");
  revalidateAccount(accountId);
}

export async function rejectAccount(accountId: string, reason: string = "") {
  await verifySuperAdmin();
  // Delegate to reviewer flow (handles notifications + reviewed_by/reviewed_at)
  await reviewerRejectAccount(accountId, reason || "Không đáp ứng yêu cầu");
}

export async function superAdminDeleteAccount(accountId: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service.from("accounts").delete().eq("id", accountId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/super/accounts");
  revalidateAccount(accountId);
}

export async function superAdminUpdateAccount(
  accountId: string,
  originalUserId: string,
  payload: Record<string, unknown>
): Promise<{ error: string } | void> {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  const { data: current, error: fetchErr } = await service
    .from("accounts")
    .select("user_id, status, is_priority")
    .eq("id", accountId)
    .single();

  if (fetchErr || !current) {
    return { error: fetchErr?.message ?? "Không tìm thấy tài khoản" };
  }

  try {
    await assertAvailablePriorityLimit(service, accountId, current, payload);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Không thể cập nhật nổi bật." };
  }

  const { error } = await service
    .from("accounts")
    .update({ ...payload, user_id: originalUserId })
    .eq("id", accountId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/super/accounts");
  revalidatePath(`/dashboard/super/accounts/${accountId}/edit`);
  revalidatePath("/dashboard/accounts");
  revalidateAccount(accountId);
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
    is_rejected: false,
  };

  const { error: insertErr } = await service.from("accounts").insert(copyPayload);
  if (insertErr) throw new Error(insertErr.message);

  revalidatePath("/dashboard/super/accounts");
  revalidatePath("/dashboard/super/pending");
  revalidatePath("/dashboard/accounts");
  // copyAccountToAdmin creates unapproved account — no web revalidation needed
}

export async function buybackAccount(
  accountId: string,
  buybackPrice: number,
  emailId: string | null,
) {
  const superAdmin = await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  const { data: source, error: sourceErr } = await service
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .single();

  if (sourceErr || !source) throw new Error(sourceErr?.message ?? "Không tìm thấy tài khoản");
  if (source.status !== "Sold") throw new Error("Chỉ có thể thu lại tài khoản đã bán");

  const { error: insertErr } = await service.from("accounts").insert({
    title: source.title,
    description: source.description,
    purchase_price: buybackPrice,
    selling_price: source.selling_price,
    original_price: null,
    images: source.images,
    primary_image_url: source.primary_image_url,
    status: "Available",
    total_gp: source.total_gp,
    total_coins_android: source.total_coins_android,
    total_coins_ios: source.total_coins_ios,
    team_strength: source.team_strength,
    server_region: source.server_region,
    monthly_log_quota: source.monthly_log_quota,
    email_id: emailId,
    user_id: superAdmin.id,
    is_priority: false,
    is_clone: source.is_clone ?? false,
    is_approved: true,
  });
  if (insertErr) throw new Error(insertErr.message);

  revalidatePath("/dashboard/super/accounts");
  revalidatePath("/dashboard/accounts");
  revalidateAccount();
}

export async function createAdmin(email: string, password: string, name?: string) {
  await verifySuperAdmin();
  if (!email || !email.includes("@")) throw new Error("Email không hợp lệ.");
  if (!password || password.length < 8) throw new Error("Mật khẩu phải có ít nhất 8 ký tự.");
  const service = createSupabaseServiceClient();
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { full_name: name } : undefined,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/super/admins");
  return data.user;
}

export async function updateAdminProfile(
  adminId: string,
  profile: {
    name: string;
    zalo_name?: string | null;
  }
) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service.auth.admin.updateUserById(adminId, {
    user_metadata: { full_name: profile.name },
  });
  if (error) throw new Error(error.message);

  // Sync other fields in admin_settings
  await service
    .from("admin_settings")
    .upsert(
      {
        user_id: adminId,
        zalo_name: profile.zalo_name ?? null,
      },
      { onConflict: "user_id" }
    );

  revalidatePath("/dashboard/super/admins");
  revalidateSeller();
}

export async function deleteAdmin(adminId: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  // Delete all accounts belonging to this admin.
  const { error: e1 } = await service
    .from("accounts")
    .delete()
    .eq("user_id", adminId);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await service
    .from("emails")
    .update({ user_id: null })
    .eq("user_id", adminId);
  if (e2) throw new Error(e2.message);

  const { error } = await service.auth.admin.deleteUser(adminId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/super/admins");
  revalidatePath("/dashboard/super/accounts");
  // Cascade delete removes all seller's accounts from storefront
  revalidateWeb(["/", "/bao-ke"]);
}

export async function updateTransactionBoxUrl(
  adminId: string,
  transactionBoxUrl: string | null,
) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("admin_settings")
    .upsert(
      { user_id: adminId, transaction_box_url: transactionBoxUrl },
      { onConflict: "user_id" }
    );
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/super/admins");
}

export async function resetAdminPassword(adminId: string, newPassword: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service.auth.admin.updateUserById(adminId, {
    password: newPassword,
  });
  if (error) throw new Error(error.message);
}

// ── Seller Collateral (Ký quỹ) ─────────────────────────────────────────────

export async function updateSellerCollateral(
  adminId: string,
  changeType: "increase" | "decrease" | "refund" | "initial",
  amount: number,
  notes?: string,
) {
  const superAdmin = await verifySuperAdmin();
  if (amount <= 0) throw new Error("Số tiền phải lớn hơn 0");

  const service = createSupabaseServiceClient();

  // Get current collateral
  const { data: settings } = await service
    .from("admin_settings")
    .select("collateral_amount")
    .eq("user_id", adminId)
    .single();

  const currentAmount = Number(settings?.collateral_amount) || 0;
  let newTotal: number;

  if (changeType === "increase" || changeType === "initial") {
    newTotal = currentAmount + amount;
  } else {
    newTotal = currentAmount - amount;
    if (newTotal < 0) throw new Error("Số tiền ký quỹ không thể âm");
  }

  // Update admin_settings
  const { error: updateErr } = await service
    .from("admin_settings")
    .upsert(
      {
        user_id: adminId,
        collateral_amount: newTotal,
        collateral_updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (updateErr) throw new Error(updateErr.message);

  // Insert history record
  const { error: histErr } = await service
    .from("seller_collateral_history")
    .insert({
      user_id: adminId,
      change_type: changeType,
      amount,
      new_total: newTotal,
      notes: notes || null,
      created_by: superAdmin.id,
    });
  if (histErr) throw new Error(histErr.message);

  revalidatePath("/dashboard/super/admins");
  revalidatePath("/dashboard");
}

export async function getSuperAccountForEdit(accountId: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  const [{ data: account }, { data: allEmails }, { data: linkedAccounts }] =
    await Promise.all([
      service
        .from("accounts")
        .select("id, title, description, selling_price, purchase_price, original_price, images, primary_image_url, status, total_gp, total_coins_android, total_coins_ios, team_strength, is_priority, is_clone, is_approved, is_rejected, server_region, monthly_log_quota, email_id, user_id, created_at, updated_at, deposit_customer_name, deposit_customer_contact, deposit_amount, deposit_hold_until, deposit_notes")
        .eq("id", accountId)
        .single(),
      service.from("emails").select("id, email_address, password, recovery_info, user_id, created_at, updated_at").order("email_address"),
      service.from("accounts").select("email_id").not("email_id", "is", null).neq("id", accountId),
    ]);

  if (!account) return null;

  const linkedIds = new Set((linkedAccounts ?? []).map((a: { email_id: string }) => a.email_id));
  const availableEmails = (allEmails ?? []).filter((e: { id: string }) => !linkedIds.has(e.id));

  if (account.email_id) {
    const cur = (allEmails ?? []).find((e: { id: string }) => e.id === account.email_id);
    if (cur && !availableEmails.find((e: { id: string }) => e.id === cur.id)) {
      availableEmails.unshift(cur);
    }
  }

  return { account, availableEmails };
}

export async function getSellerCollateralHistory(adminId: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("seller_collateral_history")
    .select("*")
    .eq("user_id", adminId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// ============================================
// Site Settings
// ============================================

export async function updateSiteSetting(key: string, value: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/super/settings");
  revalidateSiteSettings();
}
