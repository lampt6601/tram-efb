import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from '@thc-efb/supabase/service';

// Simple in-memory rate limiter (per Edge Function instance)
// For Hobby plan: limit aggressive scrapers / spam bots
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests
const RATE_WINDOW_MS = 60_000; // per 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  return false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> },
) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { accountId } = await params;
  const type = request.nextUrl.searchParams.get("type");

  if (type !== "transaction_box") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const service = createSupabaseServiceClient();

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
    .select("transaction_box_url")
    .eq("user_id", account.user_id)
    .single();

  const link = settings?.transaction_box_url;

  if (!link) {
    return NextResponse.json(
      { error: "Contact not available" },
      { status: 404 },
    );
  }

  const response = NextResponse.redirect(link, 302);
  response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
  return response;
}
