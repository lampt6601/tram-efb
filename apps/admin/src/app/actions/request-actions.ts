"use server";

import { createSupabaseServiceClient } from "@thc-efb/supabase/service";

interface SubmitRequestInput {
  detail: string;
  priceLevel?: string;
  requesterName: string;
  contactPlatform: string;
}

export async function submitAccountRequest(input: SubmitRequestInput) {
  if (!input.detail.trim() || !input.requesterName.trim()) {
    return { error: "Vui lòng nhập chi tiết yêu cầu và tên của bạn." };
  }

  if (input.detail.length > 1000) {
    return { error: "Chi tiết yêu cầu quá dài (tối đa 1000 ký tự)." };
  }

  if (input.requesterName.length > 100) {
    return { error: "Tên quá dài (tối đa 100 ký tự)." };
  }

  const service = createSupabaseServiceClient();

  const { error } = await service.from("account_requests").insert({
    detail: input.detail.trim(),
    price_level: input.priceLevel?.trim() || null,
    requester_name: input.requesterName.trim(),
    contact_platform: input.contactPlatform.trim(),
    completed: false,
  });

  if (error) {
    console.error("Account request error:", error);
    return { error: "Không thể gửi yêu cầu. Vui lòng thử lại." };
  }

  return { success: true };
}
