import { createSupabaseServiceClient } from "@thc-efb/supabase/service";

export type NotificationType =
  | "sell_request"
  | "application"
  | "account_approved"
  | "account_created";

export interface CreateNotificationInput {
  userId?: string | null; // null = broadcast to all admins
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

/**
 * Insert a notification into admin_notifications table.
 * Uses service client (bypasses RLS).
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  await supabase.from("admin_notifications").insert({
    user_id: input.userId ?? null,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    data: input.data ?? {},
  });
}

/**
 * Get unread notification count for a user (own + broadcasts).
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createSupabaseServiceClient();

  const { count } = await supabase
    .from("admin_notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false)
    .or(`user_id.eq.${userId},user_id.is.null`);

  return count ?? 0;
}
