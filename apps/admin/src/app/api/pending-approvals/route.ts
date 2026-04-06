import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";

/**
 * GET /api/pending-approvals
 * Returns accounts pending super-admin approval.
 * Only accessible by super admin.
 * Called every time the notification bell is opened — always returns fresh data.
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

  // Fetch pending accounts (not approved, not sold)
  const { data: accounts, error } = await service
    .from("accounts")
    .select(
      "id, title, selling_price, primary_image_url, status, user_id, created_at"
    )
    .eq("is_approved", false)
    .neq("status", "Sold")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Resolve admin names from auth users
  const userIds = [...new Set((accounts ?? []).map((a) => a.user_id))];
  const adminMap: Record<string, string> = {};

  if (userIds.length > 0) {
    // Use service client to get user metadata (full_name)
    const { data: usersData } = await service.auth.admin.listUsers({
      perPage: 100,
    });
    if (usersData?.users) {
      for (const u of usersData.users) {
        if (userIds.includes(u.id)) {
          adminMap[u.id] =
            (u.user_metadata?.full_name as string) || u.email || "";
        }
      }
    }
  }

  const pendingAccounts = (accounts ?? []).map((acc) => ({
    ...acc,
    admin_name: adminMap[acc.user_id] || "Người bán",
  }));

  return NextResponse.json({
    accounts: pendingAccounts,
    count: pendingAccounts.length,
  });
}
