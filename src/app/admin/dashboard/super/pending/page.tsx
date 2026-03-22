import { checkIsSuperAdmin } from "@/lib/super-admin";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function PendingApprovalPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !checkIsSuperAdmin(user.email)) redirect("/admin/dashboard");

  redirect("/admin/dashboard/super/accounts?approval=pending");
}
