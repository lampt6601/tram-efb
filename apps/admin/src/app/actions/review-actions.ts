"use server";

import { createSupabaseAnonClient } from "@thc-efb/supabase/anon";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
import { sendPushToAllAdmins } from "@/lib/push";

interface SubmitReviewInput {
  accountId: string;
  reviewerName: string;
  rating: number;
  comment?: string;
}

export async function submitReview(input: SubmitReviewInput) {
  // Validate input
  if (!input.accountId || !input.reviewerName || !input.rating) {
    return { error: "Vui lòng điền đầy đủ thông tin." };
  }
  if (input.rating < 1 || input.rating > 5) {
    return { error: "Đánh giá phải từ 1 đến 5 sao." };
  }
  if (input.reviewerName.length > 100) {
    return { error: "Tên quá dài (tối đa 100 ký tự)." };
  }
  if (input.comment && input.comment.length > 500) {
    return { error: "Nhận xét quá dài (tối đa 500 ký tự)." };
  }

  const supabase = createSupabaseAnonClient();

  // Verify the account exists and is sold
  const { data: account } = await supabase
    .from("public_sold_accounts")
    .select("id")
    .eq("id", input.accountId)
    .single();

  if (!account) {
    return { error: "Chỉ có thể đánh giá tài khoản đã bán." };
  }

  const { error } = await supabase.from("reviews").insert({
    account_id: input.accountId,
    reviewer_name: input.reviewerName.trim(),
    rating: input.rating,
    comment: input.comment?.trim() || null,
  });

  if (error) {
    console.error("Submit review error:", error);
    return { error: "Không thể gửi đánh giá. Vui lòng thử lại." };
  }

  revalidatePath(`/accounts/${input.accountId}`);

  // Notify admins about new review (non-blocking)
  const notifTitle = `⭐ Đánh giá mới (${input.rating} sao)`;
  const notifBody = `${input.reviewerName}: ${input.comment || "Không có nhận xét"}`;
  Promise.allSettled([
    createNotification({
      type: "review",
      title: notifTitle,
      body: notifBody,
      data: { accountId: input.accountId, url: "/dashboard/super/reviews" },
    }),
    sendPushToAllAdmins({
      title: notifTitle,
      body: notifBody,
      url: "/dashboard/super/reviews",
      tag: `review-${input.accountId}`,
    }),
  ]);

  return { success: true, message: "Đánh giá đã được gửi và đang chờ duyệt!" };
}

export async function approveReview(reviewId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("reviews")
    .update({ is_approved: true })
    .eq("id", reviewId);

  if (error) {
    return { error: "Không thể duyệt đánh giá." };
  }

  revalidatePath("/dashboard/reviews");
  return { success: true };
}

export async function deleteReview(reviewId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const service = createSupabaseServiceClient();
  const { error } = await service.from("reviews").delete().eq("id", reviewId);

  if (error) {
    return { error: "Không thể xoá đánh giá." };
  }

  revalidatePath("/dashboard/reviews");
  return { success: true };
}
