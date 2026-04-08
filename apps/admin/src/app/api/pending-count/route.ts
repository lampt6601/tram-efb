import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { checkIsBoardMember } from "@thc-efb/shared/approval-board";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperAdmin = checkIsSuperAdmin(user.email);
    const service = createSupabaseServiceClient();

    const isBoardMember = isSuperAdmin
      ? false
      : ((await checkIsBoardMember(service, user.id)) as boolean);

    if (!isSuperAdmin && !isBoardMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { count, error } = await service
      .from("accounts")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", false)
      .eq("is_rejected", false)
      .neq("status", "Sold");

    if (error) {
      console.error("Failed to fetch pending count:", error);
      return NextResponse.json(
        { error: "Failed to fetch pending count" },
        { status: 500 },
      );
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch (error) {
    console.error("Unexpected error in /api/pending-count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

