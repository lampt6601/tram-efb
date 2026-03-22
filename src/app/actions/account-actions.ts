"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { assertAvailablePriorityLimit } from "@/lib/account-priority";
import { revalidatePath } from "next/cache";

/**
 * Admin đổi trạng thái nổi bật cho acc của chính mình (giới hạn 2 acc Available + nổi bật).
 */
export async function toggleAccountPriority(accountId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: row, error: fetchErr } = await supabase
    .from("accounts")
    .select("id, user_id, status, is_priority")
    .eq("id", accountId)
    .single();

  if (fetchErr || !row) throw new Error(fetchErr?.message ?? "Không tìm thấy tài khoản");
  if (row.user_id !== user.id) throw new Error("Unauthorized");

  const next = !row.is_priority;

  await assertAvailablePriorityLimit(supabase, accountId, row, {
    is_priority: next,
  });

  const { error } = await supabase
    .from("accounts")
    .update({ is_priority: next })
    .eq("id", accountId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard/accounts");
  revalidatePath("/"); // slider acc nổi bật trang chủ
}
