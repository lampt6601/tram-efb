"use server";

import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseAnonClient } from "@thc-efb/supabase/anon";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { revalidatePath } from "next/cache";
import { uploadFileToImageKit } from "@/lib/imagekit";

export async function updateMyProfile(name: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.auth.updateUser({
    data: { full_name: name },
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/profile");
  revalidatePath("/");
}

export async function changeMyPassword(
  currentPassword: string,
  newPassword: string,
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) throw new Error("Unauthorized");
  if (!newPassword || newPassword.length < 8) throw new Error("Mật khẩu mới phải có ít nhất 8 ký tự.");

  // Verify current password by attempting sign-in with anon client
  const { error: signInError } = await createSupabaseAnonClient()
    .auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

  if (signInError) throw new Error("Mật khẩu hiện tại không đúng.");

  // Update to new password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw new Error(error.message);
}

export async function uploadAdminAvatar(formData: FormData): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) throw new Error("No file provided");
  if (file.size > 4 * 1024 * 1024) throw new Error("Ảnh quá lớn. Tối đa 4MB.");

  return await uploadFileToImageKit(file);
}

export async function updateMyZaloName(zaloName: string | null) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("admin_settings")
    .upsert(
      { user_id: user.id, zalo_name: zaloName },
      { onConflict: "user_id" }
    );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/profile");
  revalidatePath("/bao-ke");
}

export async function updateMyAvatar(avatarUrl: string | null) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("admin_settings")
    .upsert(
      { user_id: user.id, avatar_url: avatarUrl },
      { onConflict: "user_id" }
    );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function linkTelegramAccount(telegramUserId: number) {
  if (!telegramUserId || typeof telegramUserId !== "number") {
    throw new Error("ID Telegram không hợp lệ.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const service = createSupabaseServiceClient();

  // Check if this Telegram ID is already linked to another admin
  const { data: existing } = await service
    .from("admin_settings")
    .select("user_id")
    .eq("telegram_user_id", telegramUserId)
    .single();

  if (existing && existing.user_id !== user.id) {
    throw new Error("Tài khoản Telegram này đã được liên kết với một admin khác.");
  }

  const { error } = await service
    .from("admin_settings")
    .upsert(
      { user_id: user.id, telegram_user_id: telegramUserId },
      { onConflict: "user_id" }
    );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/profile");
}

export async function unlinkTelegramAccount() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("admin_settings")
    .update({ telegram_user_id: null })
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/profile");
}
