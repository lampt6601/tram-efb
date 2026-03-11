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

  return <AdminShell isSuperAdmin={isSuperAdmin}>{children}</AdminShell>;
}
