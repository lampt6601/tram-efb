import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";
import { redirect } from "next/navigation";
import { UserCircle, ShieldCheck, Store } from "lucide-react";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordSection } from "./ChangePasswordSection";
import { SellerProfileForm } from "./SellerProfileForm";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const isSuperAdmin = checkIsSuperAdmin(user.email);
  const currentName = (user.user_metadata?.full_name as string) ?? "";

  // Fetch current seller profile
  const service = createSupabaseServiceClient();
  const { data: settings } = await service
    .from("admin_settings")
    .select("display_name, avatar_url, zalo_link, facebook_link")
    .eq("user_id", user.id)
    .single();

  const sellerProfile = {
    display_name: (settings?.display_name as string) ?? "",
    avatar_url: (settings?.avatar_url as string) ?? "",
    zalo_link: (settings?.zalo_link as string) ?? "",
    facebook_link: (settings?.facebook_link as string) ?? "",
  };

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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {(currentName || user.email || "?")[0].toUpperCase()}
            </div>
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
        <div className="p-6">
          <ProfileForm currentName={currentName} email={user.email ?? ""} />
        </div>
      </div>

      {/* Seller Profile */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-500/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
              <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Hồ Sơ Người Bán</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thông tin này sẽ hiển thị cho người mua trên trang chi tiết tài khoản bạn đăng bán.
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <SellerProfileForm current={sellerProfile} />
        </div>
      </div>

      <div className="mt-6">
        <ChangePasswordSection />
      </div>
    </div>
  );
}
