"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAnonClient } from "@/lib/supabase-anon";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
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

  // Sync display_name in admin_settings so public views use the same name
  const service = createSupabaseServiceClient();
  await service
    .from("admin_settings")
    .upsert(
      { user_id: user.id, display_name: name },
      { onConflict: "user_id" }
    );

  revalidatePath("/admin/dashboard/profile");
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
  revalidatePath("/admin/dashboard/profile");
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
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}
