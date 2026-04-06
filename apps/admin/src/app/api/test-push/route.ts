import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { sendPushToUser } from "@/lib/web-push";

/**
 * GET /api/test-push
 * Sends a test push notification to the current user.
 * Super admin only. Used to verify push infrastructure works.
 *
 * Returns diagnostic info: subscription count, send results, errors.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !checkIsSuperAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createSupabaseServiceClient();

  // 1. Check subscriptions exist
  const { data: subs, error: subsError } = await service
    .from("push_subscriptions")
    .select("id, endpoint, device_name, created_at")
    .eq("user_id", user.id);

  if (subsError) {
    return NextResponse.json({
      ok: false,
      step: "fetch_subscriptions",
      error: subsError.message,
    });
  }

  if (!subs?.length) {
    return NextResponse.json({
      ok: false,
      step: "no_subscriptions",
      message: "Không tìm thấy subscription nào. Hãy bật thông báo đẩy trước.",
      userId: user.id,
    });
  }

  // 2. Check VAPID keys configured
  const hasVapidPublic = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const hasVapidPrivate = !!process.env.VAPID_PRIVATE_KEY;

  if (!hasVapidPublic || !hasVapidPrivate) {
    return NextResponse.json({
      ok: false,
      step: "vapid_missing",
      hasVapidPublic,
      hasVapidPrivate,
    });
  }

  // 3. Try sending test push
  try {
    await sendPushToUser(user.id, {
      title: "🔔 Test Push Notification",
      body: "Nếu bạn thấy thông báo này, push đang hoạt động!",
      url: "/dashboard",
      tag: "test-push",
    });

    return NextResponse.json({
      ok: true,
      subscriptions: subs.map((s) => ({
        id: s.id,
        device: s.device_name,
        endpoint: s.endpoint.slice(0, 60) + "...",
        created: s.created_at,
      })),
      message: "Push đã được gửi thành công. Kiểm tra thông báo trên thiết bị.",
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      step: "send_failed",
      error: err instanceof Error ? err.message : String(err),
      subscriptions: subs.length,
    });
  }
}
