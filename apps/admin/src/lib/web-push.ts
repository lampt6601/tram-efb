import webpush from "web-push";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { SUPER_ADMIN_EMAIL } from "@thc-efb/shared/super-admin";

// Configure VAPID credentials once
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:tranhuucanh2000@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
  badgeCount?: number;
  actions?: Array<{ action: string; title: string; url?: string }>;
}

/**
 * Send push notification to a specific user (all their devices).
 * Automatically cleans up expired/invalid subscriptions.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, keys_p256dh, keys_auth")
    .eq("user_id", userId);

  if (!subscriptions?.length) return;

  const expiredIds: string[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys_p256dh,
              auth: sub.keys_auth,
            },
          },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        console.error(`[web-push] Failed to send to ${sub.endpoint.slice(0, 50)}...`, { statusCode, err });
        // 404 or 410 = subscription expired/unsubscribed
        if (statusCode === 404 || statusCode === 410) {
          expiredIds.push(sub.id);
        }
      }
    })
  );

  // Clean up expired subscriptions
  if (expiredIds.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", expiredIds);
  }
}

/**
 * Send push notification to the super admin (all devices).
 * Uses SUPER_ADMIN_EMAIL from shared module (has fallback).
 */
export async function sendPushToSuperAdmin(
  payload: PushPayload
): Promise<void> {
  try {
    const supabase = createSupabaseServiceClient();

    // Look up super admin's push subscriptions directly via email → user ID
    const { data: usersData } = await supabase.auth.admin.listUsers({
      perPage: 100,
    });
    const superAdmin = usersData?.users?.find(
      (u) => u.email === SUPER_ADMIN_EMAIL
    );

    if (!superAdmin) {
      console.warn("[web-push] Super admin not found:", SUPER_ADMIN_EMAIL);
      return;
    }

    await sendPushToUser(superAdmin.id, payload);
  } catch (err) {
    console.error("[web-push] sendPushToSuperAdmin failed:", err);
  }
}
