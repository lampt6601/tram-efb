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
      .select("*")
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
