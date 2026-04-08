import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Check if a user is a member of the approval board.
 * Must be called with the service client (bypasses RLS).
 */
export async function checkIsBoardMember(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("approval_board_members")
    .select("id")
    .eq("user_id", userId)
    .single();
  return !!data;
}
