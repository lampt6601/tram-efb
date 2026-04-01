import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";
import { redirect, notFound } from "next/navigation";

export const metadata: Metadata = { title: "Chỉnh Sửa Tài Khoản (Super)" };
import { SuperAdminAccountForm } from "./SuperAdminAccountForm";
import type { Account, Email } from "@/types/database";

export default async function SuperAdminEditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !checkIsSuperAdmin(user.email)) redirect("/admin/dashboard");

  const { id } = await params;
  const service = createSupabaseServiceClient();

  const { data: account } = await service
    .from("accounts").select("id, title, description, selling_price, purchase_price, original_price, images, primary_image_url, status, total_gp, total_coins_android, total_coins_ios, team_strength, is_priority, is_clone, is_approved, server_region, monthly_log_quota, email_id, user_id, created_at, updated_at").eq("id", id).single();
  if (!account) notFound();

  const { data: allEmails } = await service
    .from("emails").select("id, email_address, password, recovery_info, user_id, created_at, updated_at").order("email_address");

  const { data: linkedAccounts } = await service
    .from("accounts").select("email_id").not("email_id", "is", null).neq("id", id);

  const linkedEmailIds = new Set(
    (linkedAccounts ?? []).map((a: { email_id: string }) => a.email_id)
  );
  const availableEmails = (allEmails ?? []).filter((e: Email) => !linkedEmailIds.has(e.id));

  if (account.email_id) {
    const cur = (allEmails ?? []).find((e: Email) => e.id === account.email_id);
    if (cur && !availableEmails.find((e: Email) => e.id === cur.id)) {
      availableEmails.unshift(cur);
    }
  }

  return (
    <SuperAdminAccountForm
      account={account as Account}
      availableEmails={availableEmails as Email[]}
    />
  );
}
