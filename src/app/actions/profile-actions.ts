"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAnonClient } from "@/lib/supabase-anon";
import { revalidatePath } from "next/cache";

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
