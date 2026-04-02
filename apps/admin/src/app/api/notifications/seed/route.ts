import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";

/**
 * DELETE /api/notifications/seed
 * Deletes ALL notifications. Dev only.
 */
export async function DELETE() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Dev only" }, { status: 403 });
  }
  const supabase = createSupabaseServiceClient();
  const { count } = await supabase
    .from("admin_notifications")
    .delete()
    .gte("created_at", "2000-01-01")
    .select("id", { count: "exact", head: true });
  return NextResponse.json({ ok: true, deleted: count ?? 0 });
}

/**
 * POST /api/notifications/seed
 * Clears old notifications then seeds fresh test notifications with deep-link URLs.
 * Only works in development mode.
 */
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Dev only" }, { status: 403 });
  }

  const supabase = createSupabaseServiceClient();

  // Clear all existing notifications first
  await supabase.from("admin_notifications").delete().gte("created_at", "2000-01-01");

  // Fetch a real account to deep-link to
  const { data: account } = await supabase
    .from("accounts")
    .select("id, title")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch a real sell request to deep-link to
  const { data: sellRequest } = await supabase
    .from("sell_requests")
    .select("id, seller_name")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch a real seller application to deep-link to
  const { data: application } = await supabase
    .from("seller_applications")
    .select("id, full_name")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const notifications = [];

  // 1. Account needs approval notification
  if (account) {
    notifications.push({
      user_id: null,
      type: "account_created",
      title: `🆕 Tạo mới: ${account.title}`,
      body: "Test Admin (test@example.com)",
      data: {
        accountId: account.id,
        url: `/dashboard/super/accounts?approval=pending&detail=${account.id}`,
      },
      is_read: false,
    });

    // 2. Account update notification
    notifications.push({
      user_id: null,
      type: "account_created",
      title: `✏️ Cập nhật: ${account.title}`,
      body: "Test Admin (test@example.com)",
      data: {
        accountId: account.id,
        url: `/dashboard/super/accounts?detail=${account.id}`,
      },
      is_read: false,
    });
  }

  // 3. Sell request notification
  if (sellRequest) {
    notifications.push({
      user_id: null,
      type: "sell_request",
      title: "🏷️ Yêu cầu bán acc mới",
      body: `${sellRequest.seller_name} - 500k`,
      data: {
        url: `/dashboard/sell-requests?highlight=${sellRequest.id}`,
      },
      is_read: false,
    });
  }

  // 4. Seller application notification
  if (application) {
    notifications.push({
      user_id: null,
      type: "application",
      title: "📋 Đơn đăng ký người bán mới",
      body: `${application.full_name} - test@example.com`,
      data: {
        url: `/dashboard/super/applications?highlight=${application.id}`,
      },
      is_read: false,
    });
  }

  // 5. Generic notification (no deep-link, for comparison)
  notifications.push({
    user_id: null,
    type: "review",
    title: "⭐ Đánh giá mới",
    body: "Khách hàng vừa để lại đánh giá 5 sao",
    data: { url: "/dashboard" },
    is_read: false,
  });

  if (notifications.length === 0) {
    return NextResponse.json({ error: "No data in DB to create test notifications" }, { status: 404 });
  }

  const { error } = await supabase.from("admin_notifications").insert(notifications);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    created: notifications.length,
    details: notifications.map((n) => ({ type: n.type, title: n.title, url: n.data.url })),
  });
}
