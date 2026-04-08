import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { getApprovalBoardMembers, getEligibleAdminsForBoard } from "@/app/actions/approval-board-actions";
import { ApprovalBoardClient } from "./ApprovalBoardClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ban Duyệt" };

export default async function ApprovalBoardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !checkIsSuperAdmin(user.email)) redirect("/dashboard");

  const [members, eligibleAdmins] = await Promise.all([
    getApprovalBoardMembers(),
    getEligibleAdminsForBoard(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ban Duyệt</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Quản lý các thành viên có quyền duyệt và từ chối tài khoản.
        </p>
      </div>

      <ApprovalBoardClient members={members} eligibleAdmins={eligibleAdmins} />
    </div>
  );
}
