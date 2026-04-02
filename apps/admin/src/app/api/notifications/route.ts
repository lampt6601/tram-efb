import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";

// GET /api/notifications — fetch notifications for current user
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const unreadOnly = url.searchParams.get("unread") === "true";

  let query = supabase
    .from("admin_notifications")
    .select("*")
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also get unread count
  const { count } = await supabase
    .from("admin_notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false)
    .or(`user_id.eq.${user.id},user_id.is.null`);

  return NextResponse.json({ notifications: data, unreadCount: count ?? 0 });
}

// PATCH /api/notifications — mark notifications as read
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { ids, markAll } = body;

  if (markAll) {
    // Mark all as read for this user (own + broadcasts)
    // Can't use .or() with update, so do 2 queries
    await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .is("user_id", null)
      .eq("is_read", false);
  } else if (ids?.length) {
    await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .in("id", ids);
  }

  return NextResponse.json({ ok: true });
}
