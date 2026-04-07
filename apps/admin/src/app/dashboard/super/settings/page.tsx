import type { Metadata } from "next";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { redirect } from "next/navigation";
import { getAllSiteSettings } from "@/lib/site-settings";
import { Settings } from "lucide-react";
import { SiteSettingsForm } from "./SiteSettingsForm";

export const revalidate = 0; // always fresh

export const metadata: Metadata = { title: "Cài Đặt Chung" };

export default async function SiteSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !checkIsSuperAdmin(user.email)) redirect("/dashboard");

  const settings = await getAllSiteSettings();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center mx-auto justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20">
          <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Cài Đặt Chung</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý thông tin hiển thị trên trang công khai
          </p>
        </div>
      </div>

      <SiteSettingsForm settings={settings} />

      {settings.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
          Chưa có cài đặt nào. Hãy chạy migration <code>add_site_settings.sql</code> để khởi tạo.
        </div>
      )}
    </div>
  );
}
