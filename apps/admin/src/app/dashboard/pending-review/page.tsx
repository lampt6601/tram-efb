import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { checkIsBoardMember } from "@thc-efb/shared/approval-board";
import { getPendingAccountsForReview } from "@/app/actions/reviewer-actions";
import { ReviewAccountDrawer } from "./ReviewAccountDrawer";
import { formatCurrency } from "@thc-efb/shared/constants";
import { ClipboardCheck } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Chờ Duyệt" };

export default async function PendingReviewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isSuperAdmin = checkIsSuperAdmin(user.email);
  if (!isSuperAdmin) {
    const service = createSupabaseServiceClient();
    const isMember = await checkIsBoardMember(service, user.id);
    if (!isMember) redirect("/dashboard");
  }

  const accounts = await getPendingAccountsForReview();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chờ Duyệt</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {accounts.length === 0
              ? "Không có tài khoản nào đang chờ duyệt."
              : `${accounts.length} tài khoản đang chờ duyệt.`}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 dark:bg-emerald-500/10">
          <ClipboardCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {accounts.length}
          </span>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 dark:border-slate-700">
          <ClipboardCheck className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tất cả đã được duyệt!</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Không có tài khoản nào đang chờ xét duyệt.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              {/* Image */}
              {(account.primary_image_url ?? account.images[0]) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={account.primary_image_url ?? account.images[0]}
                  alt={account.title}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-slate-100 dark:bg-slate-700">
                  <span className="text-3xl">🎮</span>
                </div>
              )}

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {account.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {account.seller_name}
                </p>

                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>💰 {formatCurrency(account.selling_price)}</span>
                  <span>⚡ {account.total_gp?.toLocaleString()} GP</span>
                  <span>💪 {account.team_strength}</span>
                  {account.server_region && <span>🌏 {account.server_region}</span>}
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {new Date(account.created_at).toLocaleDateString("vi-VN")}
                </p>

                <div className="mt-3">
                  <ReviewAccountDrawer account={account} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
