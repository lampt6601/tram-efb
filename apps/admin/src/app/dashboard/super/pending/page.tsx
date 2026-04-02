import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";

export default async function PendingApprovalPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !checkIsSuperAdmin(user.email)) redirect("/dashboard");

  redirect("/dashboard/super/accounts?approval=pending");
}
