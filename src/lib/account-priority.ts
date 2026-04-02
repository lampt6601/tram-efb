import type { SupabaseClient } from "@supabase/supabase-js";

/** Số acc nổi bật tối đa mỗi admin (chỉ tính acc trạng thái Available). */
export const MAX_PRIORITY_AVAILABLE_ACCOUNTS = 1;

type MinimalAccountRow = {
  user_id: string;
  status: string;
  is_priority: boolean | null;
};

/**
 * Đếm số acc của admin đang Available + nổi bật, không tính `excludeAccountId`.
 */
export async function countAvailablePriorityForUser(
  client: SupabaseClient,
  userId: string,
  excludeAccountId: string,
): Promise<number> {
  const { count, error } = await client
    .from("accounts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "Available")
    .eq("is_priority", true)
    .neq("id", excludeAccountId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Chặn bật nổi bật nếu đã đủ slot (chỉ khi acc sau cập nhật là Available + is_priority).
 */
export async function assertAvailablePriorityLimit(
  client: SupabaseClient,
  accountId: string,
  current: MinimalAccountRow,
  payload: Record<string, unknown>,
): Promise<void> {
  const nextStatus =
    payload.status !== undefined ? String(payload.status) : current.status;
  const nextPriority =
    payload.is_priority !== undefined
      ? Boolean(payload.is_priority)
      : Boolean(current.is_priority);

  if (!nextPriority || nextStatus !== "Available") return;

  const others = await countAvailablePriorityForUser(
    client,
    current.user_id,
    accountId,
  );
  if (others >= MAX_PRIORITY_AVAILABLE_ACCOUNTS) {
    throw new Error(
      `Mỗi admin chỉ được ${MAX_PRIORITY_AVAILABLE_ACCOUNTS} acc nổi bật ở trạng thái Sẵn sàng. Hãy bỏ nổi bật ở acc khác trước.`,
    );
  }
}
