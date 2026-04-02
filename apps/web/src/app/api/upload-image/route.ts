import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from '@thc-efb/supabase/server';
import { uploadFileToImageKit } from "@/lib/imagekit";
import { rateLimit, getClientIp, rateLimitHeaders } from '@thc-efb/shared/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limit: 20 uploads per minute per IP
  const ip = getClientIp(request.headers);
  const rl = rateLimit(`upload:${ip}`, { limit: 20, windowSeconds: 60 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  // Auth check
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const url = await uploadFileToImageKit(file);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
