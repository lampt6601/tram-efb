import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";

export const metadata: Metadata = {
  title: {
    template: "%s | THC Admin",
    default: "Admin | THC eFootball Shop",
  },
};

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

  // Fetch avatar + disabled status in a single query (moved from middleware to save CPU)
  let adminAvatarUrl = "";
  if (user) {
    const service = createSupabaseServiceClient();
    const { data: settings } = await service
      .from("admin_settings")
      .select("avatar_url, is_disabled")
      .eq("user_id", user.id)
      .single();
    adminAvatarUrl = (settings?.avatar_url as string) ?? "";

    // Redirect disabled admins (previously checked in middleware on every request)
    if (settings?.is_disabled && !isSuperAdmin) {
      await supabase.auth.signOut();
      redirect("/login?error=disabled");
    }
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
