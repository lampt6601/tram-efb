import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isSuperAdmin = checkIsSuperAdmin(user?.email);
  const adminName = (user?.user_metadata?.full_name as string | undefined) ?? "";

  let canViewAllAccounts = false;
  if (user && !isSuperAdmin) {
    const service = createSupabaseServiceClient();
    const { data: settings } = await service
      .from("admin_settings")
      .select("can_view_all_accounts")
      .eq("user_id", user.id)
      .single();
    canViewAllAccounts = settings?.can_view_all_accounts ?? false;
  }

  return (
    <AdminShell
      isSuperAdmin={isSuperAdmin}
      adminName={adminName}
      adminEmail={user?.email ?? ""}
      canViewAllAccounts={canViewAllAccounts}
    >
      {children}
    </AdminShell>
  );
}
