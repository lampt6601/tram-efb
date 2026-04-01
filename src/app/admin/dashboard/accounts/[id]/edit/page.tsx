import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = { title: "Chỉnh Sửa Tài Khoản" };
import { AccountForm } from "@/components/admin/AccountForm";
import type { Account, Email } from "@/types/database";

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("id, title, description, selling_price, purchase_price, original_price, images, primary_image_url, status, total_gp, total_coins_android, total_coins_ios, team_strength, is_priority, is_clone, is_approved, server_region, monthly_log_quota, email_id, user_id, created_at, updated_at")
    .eq("id", id)
    .single();

  if (!account) notFound();

  // Fetch available emails server-side
  const { data: allEmails } = await supabase
    .from("emails")
    .select("*")
    .order("email_address");

  const { data: linkedAccounts } = await supabase
    .from("accounts")
    .select("email_id")
    .not("email_id", "is", null)
    .neq("id", id);

  const linkedEmailIds = new Set(
    (linkedAccounts ?? []).map((a) => a.email_id),
  );
  const availableEmails = (allEmails ?? []).filter(
    (e: Email) => !linkedEmailIds.has(e.id),
  );

  // Ensure current email is included
  if (account.email_id) {
    const currentEmail = (allEmails ?? []).find((e: Email) => e.id === account.email_id);
    if (currentEmail && !availableEmails.find((e: Email) => e.id === currentEmail.id)) {
      availableEmails.unshift(currentEmail);
    }
  }

  return <AccountForm account={account as Account} availableEmails={availableEmails} />;
}
