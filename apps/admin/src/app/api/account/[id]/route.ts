import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { getAdminUsers } from "@/lib/cached-users";
import { ACCOUNT_SELECT } from "@/lib/account-queries";
import type { AccountWithEmail } from "@thc-efb/supabase/types";

/**
 * GET /api/account/:id
 * Fetch a single account for the notification inline dialog.
 * Requires authenticated session.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSuperAdmin = checkIsSuperAdmin(user.email);
  const service = createSupabaseServiceClient();

  const { data: account, error } = await service
    .from("accounts")
    .select(ACCOUNT_SELECT)
    .eq("id", id)
    .single();

  if (error || !account) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allUsers = await getAdminUsers();
  const adminEmailMap = new Map<string, string>(
    (allUsers ?? []).map((u) => [
      u.id,
      u.user_metadata?.full_name ?? u.email ?? u.id,
    ]),
  );

  const typed = account as unknown as AccountWithEmail;
  const adminName = adminEmailMap.get(typed.user_id) ?? typed.user_id;

  return NextResponse.json({ account: typed, adminName, isSuperAdmin });
}
