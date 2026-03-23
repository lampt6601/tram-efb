"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendZaloBotNotification } from "@/lib/zalo-bot";
import { formatCurrency } from "@/lib/constants";

const actionTypeMap: Record<string, string> = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  SELL: "Bán",
  UPDATE_SALE: "Cập nhật giá Sale",
};

const actionEmoji: Record<string, string> = {
  CREATE: "🆕",
  UPDATE: "✏️",
  DELETE: "🗑️",
  SELL: "💰",
  UPDATE_SALE: "🏷️",
};

const BASE_URL = "https://thc-efb.com";

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
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const ownerEmail = "tranhuucanh2000@gmail.com";
    if (user.email === ownerEmail) return;

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

    lines.push(`🕐 ${timestamp}`);

    const caption = lines.join("\n");

    await sendZaloBotNotification(caption, primaryImageUrl);
  } catch (error) {
    console.error("Failed to notify admin action:", error);
  }
}
