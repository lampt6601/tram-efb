"use server";

import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { sendZaloBotNotification } from "@/lib/zalo-bot";
import { formatCurrency } from "@thc-efb/shared/constants";
import { SUPER_ADMIN_EMAIL } from "@thc-efb/shared/super-admin";
import { createNotification, type NotificationType } from "@/lib/notifications";
import { sendPushToAllAdmins } from "@/lib/push";

const actionTypeMap: Record<string, string> = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  RE_APPROVAL: "Cần duyệt lại",
  DELETE: "Xóa",
  SELL: "Bán",
  UPDATE_SALE: "Cập nhật giá Sale",
};

const actionEmoji: Record<string, string> = {
  CREATE: "🆕",
  UPDATE: "✏️",
  RE_APPROVAL: "🔄",
  DELETE: "🗑️",
  SELL: "💰",
  UPDATE_SALE: "🏷️",
};

const BASE_URL = "https://thc-efb.com";
const ADMIN_URL = "https://admin.thc-efb.com";

/**
 * Notifies the owner via Zalo Bot when a different admin performs an action.
 * Non-blocking: never throws — errors are logged silently.
 */
export async function notifyAdminAction(
  actionType: string,
  accountTitle: string,
  priceDetails?: {
    purchasePrice?: number;
    sellingPrice?: number;
    originalPrice?: number | null;
  },
  accountId?: string,
  primaryImageUrl?: string | null,
  needsApproval?: boolean,
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (user.email === SUPER_ADMIN_EMAIL) return;

    const actionText = actionTypeMap[actionType] || actionType;
    const emoji = actionEmoji[actionType] || "🔔";
    const adminEmail = user.email || "Unknown";
    const adminName =
      (user.user_metadata?.full_name as string | undefined) || "";
    const timestamp = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });

    const lines: string[] = [
      `${emoji} ${actionText}: ${accountTitle}`,
      `👤 Admin: ${adminName ? `${adminName} (${adminEmail})` : adminEmail}`,
    ];

    if (priceDetails) {
      const parts: string[] = [];
      if (priceDetails.purchasePrice != null)
        parts.push(`Nhập: ${formatCurrency(priceDetails.purchasePrice)}`);
      if (priceDetails.sellingPrice != null)
        parts.push(`Bán: ${formatCurrency(priceDetails.sellingPrice)}`);
      if (priceDetails.originalPrice != null)
        parts.push(`Gốc: ${formatCurrency(priceDetails.originalPrice)}`);
      if (parts.length > 0) lines.push(`💵 ${parts.join(" | ")}`);
    }

    if (accountId) {
      lines.push(`🔗 ${BASE_URL}/accounts/${accountId}`);
    }

    if (needsApproval && accountId) {
      const approveSecret = process.env.APPROVE_SECRET_TOKEN;
      if (approveSecret) {
        lines.push("");
        lines.push(`✅ Duyệt ngay: ${ADMIN_URL}/api/approve/${accountId}?token=${approveSecret}`);
      }
    }

    lines.push(`🕐 ${timestamp}`);

    const caption = lines.join("\n");

    // Map action type to notification type
    const notifTypeMap: Record<string, NotificationType> = {
      CREATE: "account_created",
      SELL: "sell_request",
    };
    const notifType: NotificationType = notifTypeMap[actionType] || "account_created";

    // Deep-link URL — always super accounts page since only super admin views these notifications
    // (notifyAdminAction is skipped when super admin performs actions)
    const notifUrl = accountId
      ? needsApproval
        ? `/dashboard/super/accounts?approval=pending&detail=${accountId}`
        : `/dashboard/super/accounts?detail=${accountId}`
      : "/dashboard";

    // Run all notifications in parallel (non-blocking)
    await Promise.allSettled([
      // 1. Zalo bot (existing)
      sendZaloBotNotification(caption, primaryImageUrl),

      // 2. In-app notification
      createNotification({
        type: notifType,
        title: `${emoji} ${actionText}: ${accountTitle}`,
        body: adminName ? `${adminName} (${adminEmail})` : adminEmail,
        data: {
          accountId,
          url: notifUrl,
          navigateActions: [
            { id: "view", label: "Xem chi tiết", url: notifUrl },
            ...(accountId
              ? [{ id: "public", label: "Xem trang bán", url: `${BASE_URL}/accounts/${accountId}` }]
              : []),
          ],
        },
      }),

      // 3. Push notification to all admins
      sendPushToAllAdmins({
        title: `${emoji} ${actionText}`,
        body: accountTitle,
        url: notifUrl,
        tag: `admin-action-${accountId || Date.now()}`,
        actions: [
          { action: "view", title: "Xem chi tiết", url: notifUrl },
          ...(accountId
            ? [{ action: "public", title: "Xem trang bán", url: `${BASE_URL}/accounts/${accountId}` }]
            : []),
        ],
      }),
    ]);
  } catch (error) {
    console.error("Failed to notify admin action:", error);
  }
}
