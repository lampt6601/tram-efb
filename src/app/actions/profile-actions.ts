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
  revalidatePath("/admin/dashboard/profile");
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

export async function updateMySellerProfile(profile: {
  display_name?: string | null;
  avatar_url?: string | null;
  zalo_link?: string | null;
  facebook_link?: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Use service client to bypass RLS (admin_settings only allows super admin writes)
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("admin_settings")
    .upsert(
      { user_id: user.id, ...profile },
      { onConflict: "user_id" }
    );

  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard/profile");
  revalidatePath("/");
}

/**
 * Upload seller avatar to ImageKit and return the public URL.
 */
export async function uploadSellerAvatar(formData: FormData): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    throw new Error("No file provided");
  }

  // Validate file size (max 4MB)
  if (file.size > 4 * 1024 * 1024) {
    throw new Error("Ảnh quá lớn. Tối đa 4MB.");
  }

  const url = await uploadFileToImageKit(file);
  return url;
}
