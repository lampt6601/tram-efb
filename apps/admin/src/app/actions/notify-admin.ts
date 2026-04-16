"use server";

import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import {
  sendTelegramReviewerNotification,
  escapeHtml,
} from "@thc-efb/shared/telegram-bot";
import { formatCurrency } from "@thc-efb/shared/constants";
import { SUPER_ADMIN_EMAIL } from "@thc-efb/shared/super-admin";

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

const BASE_URL = "https://sap-efb.vercel.app";
const ADMIN_URL = "https://sap-efb-admin.vercel.app";

/**
 * Notifies reviewers via Telegram when an admin performs an action that needs approval.
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
  photoUrls?: string | string[] | null,
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

    // Base lines
    const header = `<b>${emoji} ${actionText}: ${safeTitle}</b>`;
    const adminLine = `👤 <b>Admin:</b> ${
      safeName ? `${safeName} (${safeEmail})` : safeEmail
    }`;
    const timestampLine = `🕐 ${timestamp}`;

    // Build reviewer price line (omits purchase price — sensitive data)
    let reviewerPriceLine = "";
    if (priceDetails) {
      const reviewerParts: string[] = [];
      if (priceDetails.sellingPrice != null)
        reviewerParts.push(`Bán: ${formatCurrency(priceDetails.sellingPrice)}`);
      if (priceDetails.originalPrice != null)
        reviewerParts.push(`Gốc: ${formatCurrency(priceDetails.originalPrice)}`);
      if (reviewerParts.length > 0)
        reviewerPriceLine = `💵 <b>Giá:</b> ${reviewerParts.join(" | ")}`;
    }

    const reviewerLines = [header, "", adminLine];
    if (reviewerPriceLine) reviewerLines.push(reviewerPriceLine);
    reviewerLines.push(timestampLine);
    const reviewerCaption = reviewerLines.join("\n");

    // Inline keyboard buttons
    const buttons: Array<Array<{ text: string; url: string }>> = [];
    if (accountId) {
      // Encode UUID as base64url for shorter deep links
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

    // Telegram — reviewer group only when approval needed
    if (needsApproval) {
      await sendTelegramReviewerNotification(
        reviewerCaption,
        photoUrls,
        buttons.length ? buttons : null,
      );
    }
  } catch (error) {
    console.error("Failed to notify admin action:", error);
  }
}
