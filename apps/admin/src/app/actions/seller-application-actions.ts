"use server";

import { createSupabaseAnonClient } from "@thc-efb/supabase/anon";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification, escapeHtml } from "@/lib/telegram-bot";
import { createNotification } from "@/lib/notifications";
import { sendPushToAllAdmins } from "@/lib/push";

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

  const { data: inserted, error } = await supabase.from("seller_applications").insert({
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    zalo_link: input.zaloLink.trim(),
    reason: input.reason?.trim() || null,
    referred_by: input.referredBy?.trim() || null,
  }).select('id').single();

  if (error || !inserted) {
    if (error?.code === "23505") {
      return { error: "Email này đã được đăng ký. Vui lòng liên hệ admin nếu cần hỗ trợ." };
    }
    console.error("Seller application error:", error);
    return { error: "Không thể gửi đơn đăng ký. Vui lòng thử lại." };
  }

  // Notify via all channels (non-blocking)
  const zaloPhone = input.zaloLink.replace(/^https?:\/\/zalo\.me\//, "");
  const notifTitle = `📋 Đơn đăng ký người bán mới`;
  const notifBody = `${input.fullName.trim()} - ${input.email.trim()}`;
  const notifUrl = `/dashboard/super/applications?highlight=${inserted.id}`;
  const appText =
    `<b>📋 Đơn đăng ký người bán mới</b>\n\n` +
    `👤 <b>Họ tên:</b> ${escapeHtml(input.fullName.trim())}\n` +
    `📧 <b>Email:</b> ${escapeHtml(input.email.trim())}\n` +
    `📱 <b>Zalo:</b> ${escapeHtml(zaloPhone)}\n` +
    (input.reason ? `💬 <b>Lý do:</b> ${escapeHtml(input.reason.trim())}\n` : "");
  const appButtons = [
    [
      { text: "👉 Duyệt đơn", url: `https://admin.thc-efb.com/dashboard/super/applications?highlight=${inserted.id}` },
      { text: "📱 Mở Admin App", web_app: { url: `https://admin.thc-efb.com/tma/dashboard/super/applications?highlight=${inserted.id}` } },
    ],
  ];

  await Promise.allSettled([
    sendTelegramNotification(appText, null, appButtons),
    createNotification({
      type: "application",
      title: notifTitle,
      body: notifBody,
      data: {
        url: notifUrl,
        navigateActions: [
          { id: "view", label: "Xem đơn ứng tuyển", url: notifUrl },
        ],
      },
    }),
    sendPushToAllAdmins({
      title: notifTitle,
      body: notifBody,
      url: notifUrl,
      tag: "application-new",
      actions: [
        { action: "view", title: "Xem đơn ứng tuyển", url: notifUrl },
      ],
    }),
  ]);

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

    // Ensure admin_settings row exists for the new seller
    if (newUser.user) {
      await service.from("admin_settings").upsert(
        { user_id: newUser.user.id },
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

  revalidatePath("/dashboard/super/applications");
  revalidatePath("/dashboard/super/admins");
  return { success: true };
}
