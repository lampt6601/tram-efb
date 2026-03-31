"use server";

import { createSupabaseAnonClient } from "@/lib/supabase-anon";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { revalidatePath } from "next/cache";
import { sendZaloBotNotification } from "@/lib/zalo-bot";

interface ApplySellerInput {
  fullName: string;
  email: string;
  password: string;
  zaloLink: string;
  reason?: string;
  referredBy?: string;
}

export async function submitSellerApplication(input: ApplySellerInput) {
  if (!input.fullName || !input.email || !input.password) {
    return { error: "Vui lòng nhập họ tên, email và mật khẩu." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    return { error: "Email không hợp lệ." };
  }

  if (input.fullName.length > 100) {
    return { error: "Họ tên quá dài (tối đa 100 ký tự)." };
  }

  if (input.password.length < 8) {
    return { error: "Mật khẩu phải có ít nhất 8 ký tự." };
  }

  const supabase = createSupabaseAnonClient();

  const { error } = await supabase.from("seller_applications").insert({
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    zalo_link: input.zaloLink.trim(),
    reason: input.reason?.trim() || null,
    referred_by: input.referredBy?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Email này đã được đăng ký. Vui lòng liên hệ admin nếu cần hỗ trợ." };
    }
    console.error("Seller application error:", error);
    return { error: "Không thể gửi đơn đăng ký. Vui lòng thử lại." };
  }

  // Notify super admin via Zalo Bot (non-blocking)
  try {
    const zaloPhone = input.zaloLink.replace(/^https?:\/\/zalo\.me\//, "");
    await sendZaloBotNotification(
      `📋 Đơn đăng ký người bán mới\n\n` +
      `👤 ${input.fullName.trim()}\n` +
      `📧 ${input.email.trim()}\n` +
      `📱 Zalo: ${zaloPhone}\n` +
      (input.reason ? `💬 Lý do: ${input.reason.trim()}\n` : "") +
      `\n👉 Duyệt tại: https://thc-efb.com/admin/dashboard/super/applications`,
    );
  } catch {
    // ignore — notification is best-effort
  }

  return { success: true, message: "Đơn đăng ký đã được gửi! Chúng tôi sẽ liên hệ sớm nhất." };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "approved" | "rejected",
  adminNote?: string,
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const service = createSupabaseServiceClient();

  // Fetch application data
  const { data: app } = await service
    .from("seller_applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (!app) return { error: "Không tìm thấy đơn đăng ký." };
  if (app.status !== "pending") return { error: "Đơn đăng ký đã được xử lý." };

  if (status === "approved") {
    // Auto-create admin account
    if (!app.password) {
      return { error: "Đơn đăng ký thiếu mật khẩu. Không thể tạo tài khoản tự động." };
    }

    const { data: newUser, error: createError } = await service.auth.admin.createUser({
      email: app.email,
      password: app.password,
      email_confirm: true,
      user_metadata: { full_name: app.full_name },
    });

    if (createError) {
      return { error: `Không thể tạo tài khoản: ${createError.message}` };
    }

    // Set up seller profile in admin_settings
    if (newUser.user) {
      await service.from("admin_settings").upsert(
        {
          user_id: newUser.user.id,
          display_name: app.full_name,
        },
        { onConflict: "user_id" },
      );
    }
  }

  // Update application status
  const { error: updateError } = await service
    .from("seller_applications")
    .update({
      status,
      admin_note: adminNote || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (updateError) {
    return { error: "Không thể cập nhật trạng thái đơn đăng ký." };
  }

  revalidatePath("/admin/dashboard/super/applications");
  revalidatePath("/admin/dashboard/super/admins");
  return { success: true };
}
