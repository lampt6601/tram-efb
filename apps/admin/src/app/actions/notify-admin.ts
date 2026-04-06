"use server";

import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { sendZaloNotification, escapeHtml } from "@/lib/zalo-bot";
import { formatCurrency } from "@thc-efb/shared/constants";
import { SUPER_ADMIN_EMAIL } from "@thc-efb/shared/super-admin";
import { createNotification, type NotificationType } from "@/lib/notifications";

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
 * Notifies the Super Admin via Zalo Bot when an admin performs an action.
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
  imageUrl?: string | null,
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

    const safeTitle = escapeHtml(accountTitle);
    const safeName = escapeHtml(adminName);
    const safeEmail = escapeHtml(adminEmail);

    const lines: string[] = [
      `<b>${emoji} ${actionText}: ${safeTitle}</b>`,
      "",
      `👤 <b>Admin:</b> ${safeName ? `${safeName} (${safeEmail})` : safeEmail}`,
    ];

    if (priceDetails) {
      const parts: string[] = [];
      if (priceDetails.purchasePrice != null)
        parts.push(`Nhập: ${formatCurrency(priceDetails.purchasePrice)}`);
      if (priceDetails.sellingPrice != null)
        parts.push(`Bán: ${formatCurrency(priceDetails.sellingPrice)}`);
      if (priceDetails.originalPrice != null)
        parts.push(`Gốc: ${formatCurrency(priceDetails.originalPrice)}`);
      if (parts.length > 0) lines.push(`💵 <b>Giá:</b> ${parts.join(" | ")}`);
    }

    lines.push(`🕐 ${timestamp}`);

    const caption = lines.join("\n");

    // Inline keyboard buttons
    const buttons: Array<Array<{ text: string; url: string }>> = [];
    if (accountId) {
      // Encode UUID as base64url (22 chars) for shorter URLs in Zalo Bot
      const shortId = Buffer.from(accountId.replace(/-/g, ""), "hex").toString("base64url");
      buttons.push([
        { text: "🔍 Xem chi tiết", url: `${ADMIN_URL}/go/${shortId}` },
      ]);
      if (needsApproval) {
        const approveSecret = process.env.APPROVE_SECRET_TOKEN;
        if (approveSecret) {
          buttons.push([
            {
              text: "✅ Duyệt ngay",
              url: `${ADMIN_URL}/api/approve/${accountId}?token=${approveSecret}`,
            },
          ]);
        }
      }
    }

    // Map action type to notification type
    const notifTypeMap: Record<string, NotificationType> = {
      CREATE: "account_created",
      SELL: "sell_request",
    };
    const notifType: NotificationType = notifTypeMap[actionType] || "account_created";

    // Deep-link URL — dedicated noti page so no heavy list query is triggered
    const notifUrl = accountId ? `/dashboard/noti?id=${accountId}` : "/dashboard";

    // Run all notifications in parallel (non-blocking)
    await Promise.allSettled([
      // 1. Zalo Bot
      sendZaloNotification(caption, imageUrl, buttons.length ? buttons : null),

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
          ],
        },
      }),

    ]);
  } catch (error) {
    console.error("Failed to notify admin action:", error);
  }
}
