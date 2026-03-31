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
  const adminName =
    (user?.user_metadata?.full_name as string | undefined) ?? "";

  // Fetch avatar from admin_settings
  let adminAvatarUrl = "";
  if (user) {
    const service = createSupabaseServiceClient();
    const { data: settings } = await service
      .from("admin_settings")
      .select("avatar_url")
      .eq("user_id", user.id)
      .single();
    adminAvatarUrl = (settings?.avatar_url as string) ?? "";
  }

  return (
    <AdminShell
      isSuperAdmin={isSuperAdmin}
      adminName={adminName}
      adminEmail={user?.email ?? ""}
      adminAvatarUrl={adminAvatarUrl}
    >
      {children}
    </AdminShell>
  );
}
