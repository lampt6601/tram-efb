import { createSupabaseServerClient } from "@/lib/supabase-server";
import { checkIsSuperAdmin } from "@/lib/super-admin";
import { redirect } from "next/navigation";
import { UserCircle, ShieldCheck } from "lucide-react";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const isSuperAdmin = checkIsSuperAdmin(user.email);
  const currentName = (user.user_metadata?.full_name as string) ?? "";

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
          <UserCircle className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ Sơ Cá Nhân</h1>
          <p className="text-sm text-slate-500">Quản lý thông tin cá nhân của bạn</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-xl font-bold text-indigo-600">
              {(currentName || user.email || "?")[0].toUpperCase()}
            </div>
            <div>
              {currentName ? (
                <>
                  <p className="font-semibold text-slate-900">{currentName}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </>
              ) : (
                <p className="font-semibold text-slate-900">{user.email}</p>
              )}
              {isSuperAdmin && (
                <div className="mt-1 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-600">Owner / Super Admin</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <ProfileForm currentName={currentName} email={user.email ?? ""} />
        </div>
      </div>
    </div>
  );
}
