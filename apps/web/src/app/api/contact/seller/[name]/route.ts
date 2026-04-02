import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from '@thc-efb/supabase/service';
import { getAdminUsers } from "@/lib/cached-users";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const sellerName = decodeURIComponent(name);
  const type = request.nextUrl.searchParams.get("type");

  if (type !== "transaction_box") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const service = createSupabaseServiceClient();

  // Find user by full_name in auth.users metadata
  const allUsers = await getAdminUsers();
  const user = (allUsers ?? []).find(
    (u) => (u.user_metadata?.full_name || u.email?.split("@")[0]) === sellerName,
  );

  if (!user) {
    return NextResponse.json(
      { error: "Contact not available" },
      { status: 404 },
    );
  }

  const { data: settings } = await service
    .from("admin_settings")
    .select("transaction_box_url")
    .eq("user_id", user.id)
    .single();

  const link = settings?.transaction_box_url;

  if (!link) {
    return NextResponse.json(
      { error: "Contact not available" },
      { status: 404 },
    );
  }

  const response = NextResponse.redirect(link, 302);
  // Cache redirect for 5 minutes to reduce repeated lookups
  response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
  return response;
}
