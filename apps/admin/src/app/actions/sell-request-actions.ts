"use server";

import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { uploadFileToImageKit } from "@thc-efb/shared/imagekit";
import { sendZaloNotification, escapeHtml } from "@thc-efb/shared/zalo-bot";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { rateLimit, getClientIp } from "@thc-efb/shared/rate-limit";

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export async function submitSellRequest(formData: FormData) {
  // Rate limit: 3 submissions per 10 minutes per IP
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const rl = rateLimit(`sell-request:${ip}`, { limit: 3, windowSeconds: 600 });
  if (!rl.success) {
    return { error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 10 phút." };
  }

  const description = (formData.get("description") as string)?.trim() || null;
  const priceExpectation = (formData.get("priceExpectation") as string)?.trim();
  const sellerName = (formData.get("sellerName") as string)?.trim();
  const zaloPhone = (formData.get("zaloPhone") as string)?.trim().replace(/[^0-9]/g, "");
  const files = formData.getAll("images") as File[];

  if (!priceExpectation || !sellerName || !zaloPhone) {
    return { error: "Vui lòng điền đầy đủ thông tin bắt buộc." };
  }

  if (zaloPhone.length < 5) {
    return { error: "Số điện thoại Zalo không hợp lệ." };
  }

  if (files.length === 0) {
    return { error: "Vui lòng tải lên ít nhất 1 ảnh acc." };
  }

  if (files.length > MAX_IMAGES) {
    return { error: `Tối đa ${MAX_IMAGES} ảnh.` };
  }

  // Validate files
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return { error: "Chỉ chấp nhận file ảnh (jpg, png, webp)." };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { error: "Mỗi ảnh tối đa 4MB." };
    }
  }

  // Upload images to ImageKit
  let imageUrls: string[];
  try {
    imageUrls = await Promise.all(
      files.map((file) => uploadFileToImageKit(file, "/sell-requests/")),
    );
  } catch {
    return { error: "Tải ảnh lên thất bại. Vui lòng thử lại." };
  }

  // Save to database
  const service = createSupabaseServiceClient();
  const { data: inserted, error } = await service.from("sell_requests").insert({
    images: imageUrls,
    description,
    price_expectation: priceExpectation,
    seller_name: sellerName,
    zalo_phone: zaloPhone,
  }).select('id').single();

  if (error || !inserted) {
    console.error("Sell request error:", error);
    return { error: "Không thể gửi yêu cầu. Vui lòng thử lại." };
  }

  // Notify via all channels (non-blocking)
  const sellRequestText =
    `<b>🏷️ Yêu cầu bán acc mới</b>\n\n` +
    `👤 <b>Người bán:</b> ${escapeHtml(sellerName)}\n` +
    `📱 <b>Zalo:</b> ${escapeHtml(zaloPhone)}\n` +
    `💰 <b>Giá:</b> ${escapeHtml(priceExpectation)}\n` +
    (description ? `📝 <b>Mô tả:</b> ${escapeHtml(description)}\n` : "") +
    `📸 ${imageUrls.length} ảnh`;
  const sellRequestButtons = [
    [
      { text: "👉 Xem yêu cầu", url: `https://admin.thc-efb.com/dashboard/sell-requests?highlight=${inserted.id}` },
    ],
  ];

  await Promise.allSettled([
    sendZaloNotification(sellRequestText, imageUrls, sellRequestButtons),
  ]);

  return { success: true };
}

export async function getSellRequests() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const service = createSupabaseServiceClient();
  const { data } = await service
    .from("sell_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function updateSellRequestStatus(
  id: string,
  status: "contacted" | "purchased" | "rejected",
  adminNote?: string,
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("sell_requests")
    .update({
      status,
      admin_note: adminNote || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: "Không thể cập nhật trạng thái." };

  revalidatePath("/dashboard/sell-requests");
  return { success: true };
}
