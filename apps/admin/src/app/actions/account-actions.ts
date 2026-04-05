"use server";

import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { assertAvailablePriorityLimit } from "@thc-efb/shared/account-priority";
import { revalidatePath } from "next/cache";

/**
 * Admin đổi trạng thái nổi bật cho acc của chính mình (giới hạn 1 acc Available + nổi bật).
 */
export async function toggleAccountPriority(
  accountId: string,
): Promise<{ success: true; next: boolean } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: row, error: fetchErr } = await supabase
    .from("accounts")
    .select("id, user_id, status, is_priority")
    .eq("id", accountId)
    .single();

  if (fetchErr || !row) return { error: fetchErr?.message ?? "Không tìm thấy tài khoản" };
  if (row.user_id !== user.id) return { error: "Unauthorized" };

  const next = !row.is_priority;

  try {
    await assertAvailablePriorityLimit(supabase, accountId, row, {
      is_priority: next,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Không thể cập nhật nổi bật." };
  }

  const { error } = await supabase
    .from("accounts")
    .update({ is_priority: next })
    .eq("id", accountId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/accounts");
  revalidatePath("/"); // slider acc nổi bật trang chủ
  return { success: true, next };
}

/**
 * Check if the current admin is restricted (non-super, no auto_approve).
 * Uses service client to bypass RLS on admin_settings table.
 */
export async function checkAdminRestricted(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return true;

  if (checkIsSuperAdmin(user.email)) return false;

  const service = createSupabaseServiceClient();
  const { data: settings } = await service
    .from("admin_settings")
    .select("auto_approve")
    .eq("user_id", user.id)
    .single();

  return !settings?.auto_approve;
}
