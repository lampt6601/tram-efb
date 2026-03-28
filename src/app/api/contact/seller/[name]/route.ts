import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const sellerName = decodeURIComponent(name);
  const type = request.nextUrl.searchParams.get("type");

  if (!type || !["zalo", "facebook"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const service = createSupabaseServiceClient();

  const { data: settings } = await service
    .from("admin_settings")
    .select("zalo_link, facebook_link")
    .eq("display_name", sellerName)
    .single();

  const link =
    type === "zalo" ? settings?.zalo_link : settings?.facebook_link;

  if (!link) {
    return NextResponse.json(
      { error: "Contact not available" },
      { status: 404 },
    );
  }

  return NextResponse.redirect(link, 302);
}
