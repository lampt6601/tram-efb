import { createSupabaseServiceClient } from '@thc-efb/supabase/service';
import { SUPER_ADMIN_EMAIL } from '@thc-efb/shared/super-admin';
import { getAdminUsers } from "@/lib/cached-users";
import { SellerApplyForm } from "./SellerApplyForm";

export const revalidate = 3600; // revalidate every hour

function getStartOfMonthISO(): string {
  const d = new Date();
  const start = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  return start.toISOString();
}

export default async function SellerApplyPage() {
  const service = createSupabaseServiceClient();
  const monthStart = getStartOfMonthISO();

  const [{ data: soldThisMonth }, allUsers] = await Promise.all([
    service
      .from("accounts")
      .select("user_id")
      .eq("status", "Sold")
      .gte("updated_at", monthStart),
    getAdminUsers(),
  ]);

  // Build map of active (non-deleted) admins, excluding super admin
  const activeAdminMap = new Map<string, string>(
    (allUsers ?? [])
      .filter((u) => !!u.email && u.email !== SUPER_ADMIN_EMAIL)
      .map((u) => [u.id, u.user_metadata?.full_name ?? u.email ?? "Người bán"]),
  );

  // Aggregate per admin — only include active admins
  const statsMap = new Map<string, { name: string; soldCount: number }>();

  for (const acc of soldThisMonth ?? []) {
    const uid = acc.user_id as string;
    const adminName = activeAdminMap.get(uid);
    if (!adminName) continue; // skip deleted admins & super admin

    const existing = statsMap.get(uid) ?? { name: adminName, soldCount: 0 };
    existing.soldCount += 1;
    statsMap.set(uid, existing);
  }

  const leaderboard = [...statsMap.values()]
    .filter((s) => s.soldCount > 0)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);

  return <SellerApplyForm leaderboard={leaderboard} />;
}
