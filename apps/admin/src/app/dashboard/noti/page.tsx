import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { getAdminUsers } from "@/lib/cached-users";
import { ACCOUNT_SELECT } from "@/lib/account-queries";
import { NotiDetailClient } from "./NotiDetailClient";
import type { AccountWithEmail } from "@thc-efb/supabase/types";

export const metadata: Metadata = { title: "Chi tiết thông báo" };

export default async function NotiPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id: accountId } = await searchParams;
  if (!accountId) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isSuperAdmin = checkIsSuperAdmin(user.email);
  const service = createSupabaseServiceClient();

  const allUsers = await getAdminUsers();
  const adminEmailMap = new Map<string, string>(
    (allUsers ?? []).map((u) => [u.id, u.user_metadata?.full_name ?? u.email ?? u.id]),
  );

  const { data: account } = await service
    .from("accounts")
    .select(ACCOUNT_SELECT)
    .eq("id", accountId)
    .single();

  if (!account) redirect("/dashboard");

  const typed = account as unknown as AccountWithEmail;
  const adminName = adminEmailMap.get(typed.user_id) ?? typed.user_id;

  return (
    <NotiDetailClient
      account={typed}
      adminName={adminName}
      showApproveButton={isSuperAdmin}
    />
  );
}
