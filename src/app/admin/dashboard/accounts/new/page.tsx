import type { Metadata } from "next";
import { AccountForm } from "@/components/admin/AccountForm";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = { title: "Thêm Tài Khoản" };
import type { Account, Email } from "@/types/database";

export default async function NewAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  let template: Account | null = null;

  if (params.from) {
    const { data } = await supabase
      .from("accounts")
      .select("id, title, description, selling_price, purchase_price, original_price, images, primary_image_url, status, total_gp, total_coins_android, total_coins_ios, team_strength, is_priority, is_clone, is_approved, server_region, monthly_log_quota, email_id, user_id, created_at, updated_at")
      .eq("id", params.from)
      .single();
    if (data) {
      // Clear fields that should not be duplicated
      template = {
        ...data,
        id: "",
        images: [],
        primary_image_url: null,
        email_id: null,
        is_priority: false,
        status: "Available" as const,
        created_at: "",
        updated_at: "",
      } as Account;
    }
  }

  // Fetch available emails server-side
  const { data: allEmails } = await supabase
    .from("emails")
    .select("*")
    .order("email_address");

  const { data: linkedAccounts } = await supabase
    .from("accounts")
    .select("email_id")
    .not("email_id", "is", null);

  const linkedEmailIds = new Set(
    (linkedAccounts ?? []).map((a) => a.email_id),
  );
  const availableEmails = (allEmails ?? []).filter(
    (e: Email) => !linkedEmailIds.has(e.id),
  );

  return <AccountForm account={template} duplicating={!!template} availableEmails={availableEmails} />;
}
