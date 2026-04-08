import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { checkIsBoardMember } from "@thc-efb/shared/approval-board";
import { getPendingAccountsForReview } from "@/app/actions/reviewer-actions";
import { PendingReviewList } from "./PendingReviewList";
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
        {accounts.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 dark:bg-emerald-500/10">
            <ClipboardCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {accounts.length}
            </span>
          </div>
        )}
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 dark:border-slate-700">
          <ClipboardCheck className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tất cả đã được duyệt!</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Không có tài khoản nào đang chờ xét duyệt.</p>
        </div>
      ) : (
        <PendingReviewList accounts={accounts} isSuperAdmin={isSuperAdmin} />
      )}
    </div>
  );
}
