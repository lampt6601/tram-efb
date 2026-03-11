"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendAdminNotificationMail } from "@/lib/mail";

// Optional: define an English-to-Vietnamese mapping for action types
const actionTypeMap: Record<string, string> = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  SELL: "Bán",
  UPDATE_SALE: "Cập nhật giá Sale (Gạch)",
};

import { formatCurrency } from "@/lib/constants";

/**
 * Notifies the owner if a different admin performs an action on an account.
 * owner email = "tranhuucanh2000@gmail.com"
 */
export async function notifyAdminAction(
  actionType: string,
  accountTitle: string,
  priceDetails?: {
    purchasePrice?: number;
    sellingPrice?: number;
    originalPrice?: number | null;
  },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return; // Not authenticated

    const ownerEmail = "tranhuucanh2000@gmail.com";

    // DO NOT notify if the action was performed by the owner themselves
    if (user.email === ownerEmail) {
      return;
    }

    const actionText = actionTypeMap[actionType] || actionType;
    const adminEmail = user.email || "Unknown Admin";

    const subject = `[THC EFB] Thông báo: Quản trị viên đã thực hiện hành động "${actionText}"`;
    const htmlContent = `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #4f46e5;">Hành động quản trị mới</h2>
        <p>Có một hành động vừa được thực hiện trên hệ thống bởi một quản trị viên khác:</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px; margin-top: 20px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%; background-color: #f9f9f9;">Admin Email:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${adminEmail}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%; background-color: #f9f9f9;">Admin ID:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${user.id}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%; background-color: #f9f9f9;">Hành động:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${actionText}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%; background-color: #f9f9f9;">Tên tài khoản:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${accountTitle}</td>
          </tr>
          ${
            priceDetails
              ? `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%; background-color: #f9f9f9;">Giá thu (Nhập):</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${priceDetails.purchasePrice != null ? formatCurrency(priceDetails.purchasePrice) : "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%; background-color: #f9f9f9;">Giá bán:</td>
            <td style="padding: 10px; border: 1px solid #ddd; color: #e11d48; font-weight: bold;">${priceDetails.sellingPrice != null ? formatCurrency(priceDetails.sellingPrice) : "N/A"}</td>
          </tr>
          `
              : ""
          }
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%; background-color: #f9f9f9;">Thời gian:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
          </tr>
        </table>
        <p style="margin-top: 30px; font-size: 12px; color: #777;">Email này được gửi tự động bởi hệ thống THC EFB.</p>
      </div>
    `;

    await sendAdminNotificationMail(subject, htmlContent);
  } catch (error) {
    console.error("Failed to notify admin action:", error);
  }
}
