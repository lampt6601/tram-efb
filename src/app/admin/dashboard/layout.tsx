import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@/lib/supabase-server";
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
  const adminName =
    (user?.user_metadata?.full_name as string | undefined) ?? "";

  return (
    <AdminShell
      isSuperAdmin={isSuperAdmin}
      adminName={adminName}
      adminEmail={user?.email ?? ""}
    >
      {children}
    </AdminShell>
  );
}
