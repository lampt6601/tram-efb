"use server";

import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { checkIsBoardMember } from "@thc-efb/shared/approval-board";
import { revalidatePath } from "next/cache";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";
import {
  buildGalleryPhotoUrls,
  escapeHtml,
  sendTelegramReviewerNotification,
} from "@thc-efb/shared/telegram-bot";
import { revalidateAccountApproval } from "@thc-efb/shared/revalidate-web";

const ADMIN_URL = "https://admin.thc-efb.com";
const BASE_URL = "https://thc-efb.com";

/**
 * Verify the current user is either a super admin or an approval board member.
 * Returns the user object if authorized, throws otherwise.
 */
async function verifyReviewer() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  if (checkIsSuperAdmin(user.email)) return user;

  const service = createSupabaseServiceClient();
  const isBoardMember = await checkIsBoardMember(service, user.id);
  if (!isBoardMember) throw new Error("Unauthorized: Not a board member");

  return user;
}

/**
 * Get reviewer's display name from user metadata.
 */
function getReviewerName(user: { user_metadata?: Record<string, unknown>; email?: string | null }): string {
  return (user.user_metadata?.full_name as string) || user.email || "Người duyệt";
}

/**
 * Fetch all accounts pending review (not approved, not rejected, not sold).
 * Accessible by board members and super admin.
 */
export async function getPendingAccountsForReview() {
  await verifyReviewer();

  const service = createSupabaseServiceClient();
  const { data: accounts, error } = await service
    .from("accounts")
    .select(
      "id, title, description, selling_price, purchase_price, primary_image_url, status, user_id, created_at, images, total_gp, total_coins_android, total_coins_ios, team_strength, server_region, monthly_log_quota"
    )
    .eq("is_approved", false)
    .eq("is_rejected", false)
    .neq("status", "Sold")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Resolve seller names
  const userIds = [...new Set((accounts ?? []).map((a) => a.user_id))];
  const sellerMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: usersData } = await service.auth.admin.listUsers({ perPage: 200 });
    if (usersData?.users) {
      for (const u of usersData.users) {
        if (userIds.includes(u.id)) {
          sellerMap[u.id] = (u.user_metadata?.full_name as string) || u.email || "";
        }
      }
    }
  }

  return (accounts ?? []).map((acc) => ({
    ...acc,
    seller_name: sellerMap[acc.user_id] || "Người bán",
  }));
}

/**
 * Approve an account. Accessible by board members and super admin.
 * Sets reviewed_by, reviewed_at, clears rejection_reason.
 */
export async function reviewerApproveAccount(accountId: string) {
  const user = await verifyReviewer();
  const service = createSupabaseServiceClient();

  // Fetch account for notification
  const { data: account, error: fetchErr } = await service
    .from("accounts")
    .select("title, primary_image_url, images, user_id")
    .eq("id", accountId)
    .single();
  if (fetchErr || !account) throw new Error(fetchErr?.message ?? "Không tìm thấy tài khoản");

  const { error } = await service
    .from("accounts")
    .update({
      is_approved: true,
      is_rejected: false,
      rejection_reason: null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", accountId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/pending-review");
  revalidatePath("/dashboard/super/pending");
  revalidatePath("/dashboard/super/accounts");
  revalidatePath("/dashboard/accounts");

  // Cross-app: approved account now visible on storefront (non-blocking)
  revalidateAccountApproval(accountId);

  // Send notifications non-blocking
  const reviewerName = getReviewerName(user);
  await Promise.allSettled([
    // Email to seller
    (async () => {
      const { data: sellerUser } = await service.auth.admin.getUserById(account.user_id);
      if (sellerUser?.user?.email) {
        await sendApprovalEmail({
          to: sellerUser.user.email,
          accountTitle: account.title,
          accountUrl: `${BASE_URL}/accounts/${accountId}`,
          reviewerName,
        });
      }
    })(),
    sendTelegramReviewerNotification(
      `<b>✅ Đã duyệt:</b> ${escapeHtml(account.title)}\n👤 <b>Bởi:</b> ${escapeHtml(reviewerName)}`,
      buildGalleryPhotoUrls(account.primary_image_url, account.images),
    ),
  ]);
}

/**
 * Reject an account with a required reason. Accessible by board members and super admin.
 * Sets is_rejected, rejection_reason, reviewed_by, reviewed_at.
 */
export async function reviewerRejectAccount(accountId: string, reason: string) {
  const user = await verifyReviewer();

  const trimmedReason = reason.trim();
  if (!trimmedReason) throw new Error("Lý do từ chối không được để trống");

  const service = createSupabaseServiceClient();

  // Fetch account for notification
  const { data: account, error: fetchErr } = await service
    .from("accounts")
    .select("title, user_id")
    .eq("id", accountId)
    .single();
  if (fetchErr || !account) throw new Error(fetchErr?.message ?? "Không tìm thấy tài khoản");

  const { error } = await service
    .from("accounts")
    .update({
      is_rejected: true,
      rejection_reason: trimmedReason,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      is_approved: false,
    })
    .eq("id", accountId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/pending-review");
  revalidatePath("/dashboard/super/pending");
  revalidatePath("/dashboard/super/accounts");
  revalidatePath("/dashboard/accounts");

  // Cross-app: rejected account removed from storefront (non-blocking)
  revalidateAccountApproval(accountId);

  // Send notifications non-blocking
  const reviewerName = getReviewerName(user);
  await Promise.allSettled([
    // Email to seller
    (async () => {
      const { data: sellerUser } = await service.auth.admin.getUserById(account.user_id);
      if (sellerUser?.user?.email) {
        await sendRejectionEmail({
          to: sellerUser.user.email,
          accountTitle: account.title,
          rejectionReason: trimmedReason,
          reviewerName,
        });
      }
    })(),
    sendTelegramReviewerNotification(
      `<b>❌ Từ chối:</b> ${escapeHtml(account.title)}\n👤 <b>Bởi:</b> ${escapeHtml(reviewerName)}\n📝 <b>Lý do:</b> ${escapeHtml(trimmedReason)}`,
    ),
  ]);
}

/**
 * Re-submit a rejected account for review.
 * Can only be called by the account owner (seller).
 */
export async function resubmitAccount(accountId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const service = createSupabaseServiceClient();

  // Verify ownership
  const { data: account, error: fetchErr } = await service
    .from("accounts")
    .select("title, user_id, is_rejected, primary_image_url, images")
    .eq("id", accountId)
    .single();
  if (fetchErr || !account) throw new Error("Không tìm thấy tài khoản");
  if (account.user_id !== user.id) throw new Error("Unauthorized");
  if (!account.is_rejected) throw new Error("Tài khoản chưa bị từ chối");

  const { error } = await service
    .from("accounts")
    .update({
      is_rejected: false,
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
      is_approved: false,
    })
    .eq("id", accountId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/accounts");

  // Notify reviewer group
  const approveSecret = process.env.APPROVE_SECRET_TOKEN;
  const buttons = approveSecret
    ? [[{ text: "✅ Duyệt ngay", url: `${ADMIN_URL}/api/approve/${accountId}?token=${approveSecret}` }]]
    : undefined;
  await sendTelegramReviewerNotification(
    `<b>🔄 Gửi lại duyệt:</b> ${escapeHtml(account.title)}`,
    buildGalleryPhotoUrls(account.primary_image_url, account.images),
    buttons,
  );
}
