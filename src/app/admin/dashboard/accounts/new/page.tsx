import { AccountForm } from "@/components/admin/AccountForm";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Account } from "@/types/database";

export default async function NewAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  let template: Account | null = null;

  if (params.from) {
    const supabase = await createSupabaseServerClient();
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

  return <AccountForm account={template} duplicating={!!template} />;
}
