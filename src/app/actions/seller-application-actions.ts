"use server";

import { createSupabaseAnonClient } from "@/lib/supabase-anon";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { revalidatePath } from "next/cache";

interface ApplySellerInput {
  fullName: string;
  email: string;
  phone?: string;
  zaloLink?: string;
  reason?: string;
}

export async function submitSellerApplication(input: ApplySellerInput) {
  if (!input.fullName || !input.email) {
    return { error: "Vui lòng nhập họ tên và email." };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    return { error: "Email không hợp lệ." };
  }

  if (input.fullName.length > 100) {
    return { error: "Họ tên quá dài (tối đa 100 ký tự)." };
  }

  const supabase = createSupabaseAnonClient();

  const { error } = await supabase.from("seller_applications").insert({
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    zalo_link: input.zaloLink?.trim() || null,
    reason: input.reason?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Email này đã được đăng ký. Vui lòng liên hệ admin nếu cần hỗ trợ." };
    }
    console.error("Seller application error:", error);
    return { error: "Không thể gửi đơn đăng ký. Vui lòng thử lại." };
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
  const { error } = await service
    .from("seller_applications")
    .update({
      status,
      admin_note: adminNote || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (error) {
    return { error: "Không thể cập nhật trạng thái đơn đăng ký." };
  }

  revalidatePath("/admin/dashboard/super/applications");
  return { success: true };
}
