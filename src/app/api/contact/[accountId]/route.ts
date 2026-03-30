import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> },
) {
  const { accountId } = await params;
  const type = request.nextUrl.searchParams.get("type"); // "zalo" | "facebook" | "transaction_box"

  if (!type || !["zalo", "facebook", "transaction_box"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const service = createSupabaseServiceClient();

  // Look up the account's user_id, then get seller contact from admin_settings
  const { data: account } = await service
    .from("accounts")
    .select("user_id")
    .eq("id", accountId)
    .single();

  if (!account) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: settings } = await service
    .from("admin_settings")
    .select("zalo_link, facebook_link, transaction_box_url")
    .eq("user_id", account.user_id)
    .single();

  const link =
    type === "zalo"
      ? settings?.zalo_link
      : type === "facebook"
        ? settings?.facebook_link
        : settings?.transaction_box_url;

  if (!link) {
    return NextResponse.json(
      { error: "Contact not available" },
      { status: 404 },
    );
  }

  return NextResponse.redirect(link, 302);
}
