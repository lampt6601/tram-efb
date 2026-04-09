import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { sendZaloNotification } from "@thc-efb/shared/zalo-bot";
import { formatCurrency } from "@thc-efb/shared/constants";

// Vietnam timezone offset: UTC+7
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

function getVietnamTodayStartUTC(): Date {
  const now = new Date();
  const vnNow = new Date(now.getTime() + VN_OFFSET_MS);
  // Midnight Vietnam time = midnight UTC minus 7h offset
  const vnMidnight = new Date(
    Date.UTC(vnNow.getUTCFullYear(), vnNow.getUTCMonth(), vnNow.getUTCDate()),
  );
  return new Date(vnMidnight.getTime() - VN_OFFSET_MS);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const todayStartUTC = getVietnamTodayStartUTC();
    const isoStart = todayStartUTC.toISOString();

    const supabase = createSupabaseServiceClient();

    // Run all queries in parallel
    const [
      newAccountsRes,
      updatedAccountsRes,
      currentInventoryRes,
      pendingApprovalRes,
      sellRequestsRes,
      sellerAppsRes,
    ] = await Promise.all([
      // Accounts created today
      supabase
        .from("accounts")
        .select("id, status, selling_price, is_approved, is_rejected")
        .gte("created_at", isoStart),

      // Accounts updated today (but created before today)
      supabase
        .from("accounts")
        .select("id, status, selling_price, is_approved, is_rejected")
        .gte("updated_at", isoStart)
        .lt("created_at", isoStart),

      // Current available inventory
      supabase
        .from("accounts")
        .select("id", { count: "exact", head: true })
        .eq("status", "Available")
        .eq("is_approved", true),

      // Accounts pending approval
      supabase
        .from("accounts")
        .select("id", { count: "exact", head: true })
        .eq("is_approved", false)
        .eq("is_rejected", false),

      // Sell requests touched today
      supabase
        .from("sell_requests")
        .select("id, status, created_at")
        .or(`created_at.gte.${isoStart},updated_at.gte.${isoStart}`),

      // Seller applications touched today
      supabase
        .from("seller_applications")
        .select("id, status, created_at")
        .or(`created_at.gte.${isoStart},updated_at.gte.${isoStart}`),
    ]);

    // --- Accounts ---
    const newAccounts = newAccountsRes.data ?? [];
    const updatedAccounts = updatedAccountsRes.data ?? [];

    const newCount = newAccounts.length;
    const soldToday = [
      ...newAccounts.filter((a) => a.status === "Sold"),
      ...updatedAccounts.filter((a) => a.status === "Sold"),
    ];
    const soldCount = soldToday.length;
    const soldRevenue = soldToday.reduce(
      (sum, a) => sum + (a.selling_price ?? 0),
      0,
    );

    const approvedToday = [
      ...newAccounts.filter((a) => a.is_approved === true),
      ...updatedAccounts.filter((a) => a.is_approved === true),
    ];
    const approvedCount = approvedToday.length;

    const availableCount = currentInventoryRes.count ?? 0;
    const pendingApprovalCount = pendingApprovalRes.count ?? 0;

    // --- Sell requests ---
    const sellRequests = sellRequestsRes.data ?? [];
    const newSellRequests = sellRequests.filter(
      (r) => r.created_at >= isoStart,
    ).length;
    const contactedSellRequests = sellRequests.filter(
      (r) => r.status === "contacted",
    ).length;
    const purchasedSellRequests = sellRequests.filter(
      (r) => r.status === "purchased",
    ).length;

    // --- Seller applications ---
    const sellerApps = sellerAppsRes.data ?? [];
    const newSellerApps = sellerApps.filter(
      (a) => a.created_at >= isoStart,
    ).length;
    const approvedSellerApps = sellerApps.filter(
      (a) => a.status === "approved",
    ).length;

    // Check if there's any activity worth reporting
    const hasAccountActivity =
      newCount > 0 || soldCount > 0 || approvedCount > 0;
    const hasSellActivity =
      newSellRequests > 0 ||
      contactedSellRequests > 0 ||
      purchasedSellRequests > 0;
    const hasAppActivity = newSellerApps > 0 || approvedSellerApps > 0;

    if (!hasAccountActivity && !hasSellActivity && !hasAppActivity) {
      return NextResponse.json({ ok: true, sent: false, reason: "no_activity" });
    }

    // Build report text
    const now = new Date();
    const vnNow = new Date(now.getTime() + VN_OFFSET_MS);
    const dateStr = vnNow.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    const timeStr = vnNow.toLocaleTimeString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
    });

    const lines: string[] = [];
    lines.push(`📊 BÁO CÁO HOẠT ĐỘNG HÔM NAY`);
    lines.push(`📅 ${dateStr} | Cập nhật lúc ${timeStr}`);

    if (hasAccountActivity) {
      lines.push(``);
      lines.push(`━━━ TÀI KHOẢN ━━━`);
      if (newCount > 0) lines.push(`🆕 Tạo mới: ${newCount}`);
      if (soldCount > 0) {
        const revenueStr = soldRevenue > 0 ? ` (${formatCurrency(soldRevenue)})` : "";
        lines.push(`💰 Đã bán: ${soldCount}${revenueStr}`);
      }
      if (approvedCount > 0) lines.push(`✅ Đã duyệt: ${approvedCount}`);
      lines.push(``);
      lines.push(`Kho hiện tại: ${availableCount} Available | ${pendingApprovalCount} chờ duyệt`);
    }

    if (hasSellActivity) {
      lines.push(``);
      lines.push(`━━━ YÊU CẦU BÁN ACC ━━━`);
      const sellParts: string[] = [];
      if (newSellRequests > 0) sellParts.push(`📥 Mới: ${newSellRequests}`);
      if (contactedSellRequests > 0) sellParts.push(`📞 Đã liên hệ: ${contactedSellRequests}`);
      if (purchasedSellRequests > 0) sellParts.push(`✅ Đã mua: ${purchasedSellRequests}`);
      lines.push(sellParts.join(" | "));
    }

    if (hasAppActivity) {
      lines.push(``);
      lines.push(`━━━ ĐƠN ĐĂNG KÝ NGƯỜI BÁN ━━━`);
      const appParts: string[] = [];
      if (newSellerApps > 0) appParts.push(`📥 Mới: ${newSellerApps}`);
      if (approvedSellerApps > 0) appParts.push(`✅ Đã duyệt: ${approvedSellerApps}`);
      lines.push(appParts.join(" | "));
    }

    const reportText = lines.join("\n");

    await sendZaloNotification(reportText);

    return NextResponse.json({ ok: true, sent: true });
  } catch (error) {
    console.error("Daily summary cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
