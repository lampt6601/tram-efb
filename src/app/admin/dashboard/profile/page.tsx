import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";
import { redirect } from "next/navigation";
import Image from "next/image";
import { UserCircle, ShieldCheck } from "lucide-react";

export const revalidate = 0; // always fresh for profile

export const metadata: Metadata = { title: "Hồ Sơ Cá Nhân" };
import { ProfileForm } from "./ProfileForm";
import { AvatarUpload } from "./AvatarUpload";
import { ChangePasswordSection } from "./ChangePasswordSection";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const isSuperAdmin = checkIsSuperAdmin(user.email);
  const currentName = (user.user_metadata?.full_name as string) ?? "";

  // Fetch current avatar
  const service = createSupabaseServiceClient();
  const { data: settings } = await service
    .from("admin_settings")
    .select("avatar_url, zalo_name")
    .eq("user_id", user.id)
    .single();
  const avatarUrl = (settings?.avatar_url as string) ?? "";
  const zaloName = (settings?.zalo_name as string) ?? "";

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
          <UserCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Hồ Sơ Cá Nhân</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý thông tin cá nhân của bạn</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={currentName || user.email || ""}
                width={48}
                height={48}
                className="h-12 w-12 rounded-xl object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {(currentName || user.email || "?")[0].toUpperCase()}
              </div>
            )}
            <div>
              {currentName ? (
                <>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{currentName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                </>
              ) : (
                <p className="font-semibold text-slate-900 dark:text-slate-100">{user.email}</p>
              )}
              {isSuperAdmin && (
                <div className="mt-1 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Owner / Super Admin</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <AvatarUpload currentAvatarUrl={avatarUrl} />
          <ProfileForm currentName={currentName} email={user.email ?? ""} currentZaloName={zaloName} />
        </div>
      </div>

      <div className="mt-6">
        <ChangePasswordSection />
      </div>
    </div>
  );
}
