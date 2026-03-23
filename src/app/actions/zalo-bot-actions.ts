"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendZaloBotNotification } from "@/lib/zalo-bot";

/**
 * Send a custom message via Zalo Bot. Requires authenticated admin.
 */
export async function sendZaloMessage(
  text: string,
  photoUrl?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { ok: false, error: "Unauthorized" };

    if (!text || text.length > 2000) {
      return { ok: false, error: "Tin nhắn phải từ 1-2000 ký tự." };
    }

    const success = await sendZaloBotNotification(text, photoUrl || null);

    if (!success) {
      return { ok: false, error: "Không thể gửi tin nhắn. Kiểm tra cấu hình Zalo Bot." };
    }

    return { ok: true };
  } catch (error) {
    console.error("sendZaloMessage error:", error);
    return { ok: false, error: "Đã có lỗi xảy ra." };
  }
}
