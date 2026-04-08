import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { checkIsBoardMember } from "@thc-efb/shared/approval-board";

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

  // Fetch avatar + disabled status + board membership in a single service call
  let adminAvatarUrl = "";
  let isBoardMember = false;
  if (user) {
    const service = createSupabaseServiceClient();
    const [settingsResult, boardResult] = await Promise.all([
      service.from("admin_settings").select("avatar_url, is_disabled").eq("user_id", user.id).single(),
      isSuperAdmin ? Promise.resolve(false) : checkIsBoardMember(service, user.id),
    ]);

    adminAvatarUrl = (settingsResult.data?.avatar_url as string) ?? "";
    isBoardMember = boardResult as boolean;

    // Redirect disabled admins (previously checked in middleware on every request)
    if (settingsResult.data?.is_disabled && !isSuperAdmin) {
      await supabase.auth.signOut();
      redirect("/login?error=disabled");
    }
  }

  return (
    <AdminShell
      isSuperAdmin={isSuperAdmin}
      isBoardMember={isBoardMember}
      adminName={adminName}
      adminEmail={user?.email ?? ""}
      adminAvatarUrl={adminAvatarUrl}
    >
      {children}
    </AdminShell>
  );
}
