import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";

export default async function TmaDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/tma/auth-error?reason=no_session");

  const isSuperAdmin = checkIsSuperAdmin(user?.email);
  const adminName =
    (user?.user_metadata?.full_name as string | undefined) ?? "";

  let adminAvatarUrl = "";
  if (user) {
    const service = createSupabaseServiceClient();
    const { data: settings } = await service
      .from("admin_settings")
      .select("avatar_url, is_disabled")
      .eq("user_id", user.id)
      .single();
    adminAvatarUrl = (settings?.avatar_url as string) ?? "";

    if (settings?.is_disabled && !isSuperAdmin) {
      await supabase.auth.signOut();
      redirect("/tma/auth-error?reason=account_disabled");
    }
  }

  return (
    <AdminShell
      isSuperAdmin={isSuperAdmin}
      adminName={adminName}
      adminEmail={user?.email ?? ""}
      adminAvatarUrl={adminAvatarUrl}
      isTma
    >
      {children}
    </AdminShell>
  );
}
