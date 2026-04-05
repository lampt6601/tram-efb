import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { validateTelegramInitData } from "@/lib/telegram-auth";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";

/**
 * POST /api/tma/auth
 *
 * Validates Telegram initData, finds the linked admin, and creates a
 * Supabase session via magic link OTP. Sets session cookies on the response.
 *
 * Body: { initData: string }
 */
export async function POST(request: NextRequest) {
  let body: { initData?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { initData } = body;
  if (!initData || typeof initData !== "string") {
    return NextResponse.json({ error: "initData is required" }, { status: 400 });
  }

  // 1. Validate Telegram initData
  const telegramUser = validateTelegramInitData(initData);
  if (!telegramUser) {
    return NextResponse.json(
      { error: "Invalid Telegram init data" },
      { status: 401 },
    );
  }

  // 2. Find admin linked to this Telegram user
  const service = createSupabaseServiceClient();
  const { data: adminSettings, error: settingsError } = await service
    .from("admin_settings")
    .select("user_id")
    .eq("telegram_user_id", telegramUser.id)
    .single();

  if (settingsError || !adminSettings) {
    return NextResponse.json(
      { error: "Tài khoản Telegram chưa được liên kết với admin nào." },
      { status: 403 },
    );
  }

  // 3. Get admin's email from auth.users
  const { data: userData, error: userError } =
    await service.auth.admin.getUserById(adminSettings.user_id);
  if (userError || !userData.user?.email) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  const adminEmail = userData.user.email;

  // 4. Generate a one-time magic link token
  const { data: linkData, error: linkError } =
    await service.auth.admin.generateLink({
      type: "magiclink",
      email: adminEmail,
    });
  if (linkError || !linkData.properties?.hashed_token) {
    console.error("generateLink error:", linkError);
    return NextResponse.json(
      { error: "Failed to generate auth token" },
      { status: 500 },
    );
  }

  // 5. Exchange the OTP for a real session and set cookies
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: sessionData, error: verifyError } =
    await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });

  if (verifyError || !sessionData.session) {
    console.error("verifyOtp error:", verifyError);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
