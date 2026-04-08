"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { StatusBadge } from "@thc-efb/ui/badge";
import { Button } from "@thc-efb/ui/button";
import { toast } from "sonner";
import type { Account } from "@thc-efb/supabase/types";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@thc-efb/ui/responsive-dialog";
import {
  ResponsiveAlertDialog,
  ResponsiveAlertDialogContent,
  ResponsiveAlertDialogHeader,
  ResponsiveAlertDialogTitle,
  ResponsiveAlertDialogDescription,
  ResponsiveAlertDialogFooter,
} from "@thc-efb/ui/responsive-alert-dialog";
import { AccountDetailContent } from "@/components/admin/AccountDetailContent";
import { reviewerApproveAccount, reviewerRejectAccount } from "@/app/actions/reviewer-actions";
import { formatCurrency } from "@thc-efb/shared/constants";

export type PendingAccount = Pick<Account,
  "id" | "title" | "description" | "selling_price" | "purchase_price" | "primary_image_url" | "status" |
  "user_id" | "created_at" | "images" | "total_gp" | "total_coins_android" | "total_coins_ios" |
  "team_strength" | "server_region" | "monthly_log_quota"
> & { seller_name?: string };

interface ReviewAccountDialogProps {
  account: PendingAccount;
  adminName: string;
  isSuperAdmin?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewAccountDialog({
  account,
  adminName,
  isSuperAdmin = false,
  open,
  onOpenChange,
}: ReviewAccountDialogProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const closeReject = useCallback(() => {
    if (!rejecting) { setRejectOpen(false); setRejectReason(""); }
  }, [rejecting]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await reviewerApproveAccount(account.id);
      toast.success(`Đã duyệt tài khoản "${account.title}"`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    setRejecting(true);
    try {
      await reviewerRejectAccount(account.id, rejectReason.trim());
      toast.success(`Đã từ chối tài khoản "${account.title}"`);
      setRejectReason("");
      setRejectOpen(false);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        <ResponsiveDialogHeader className="px-5 pt-5 pb-3 text-left">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={account.status} />
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {adminName && <span className="font-medium text-slate-600 dark:text-slate-300">{adminName} · </span>}
              ID: {account.id.slice(0, 8)}…
              {isSuperAdmin && (
                <span className="ml-2 font-medium text-slate-500 dark:text-slate-400">
                  · Giá nhập: <span className="text-amber-600 dark:text-amber-400">{formatCurrency(account.purchase_price)}</span>
                </span>
              )}
            </span>
          </div>
          <ResponsiveDialogTitle className="text-base font-semibold leading-snug">
            {account.title}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="sr-only">
            Xem chi tiết và duyệt tài khoản {account.title}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <AccountDetailContent
            hidePurchasePrice={!isSuperAdmin}
            account={{
              ...account,
              purchase_price: account.purchase_price,
              original_price: null,
              total_coins_android: account.total_coins_android ?? 0,
              total_coins_ios: account.total_coins_ios ?? 0,
              monthly_log_quota: account.monthly_log_quota ?? null,
              description: account.description ?? null,
              email_id: null,
              is_approved: false,
              is_rejected: false,
              is_priority: false,
              is_clone: false,
              updated_at: account.created_at,
              emails: null,
            }}
            adminName={adminName}
          />
        </div>

        {/* Footer: primary (Duyệt) on top, secondary (Từ chối) below */}
        {account.status !== "Sold" && (
          <ResponsiveDialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleApprove}
              disabled={approving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {approving
                ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Đang duyệt...</>
                : <><CheckCircle2 className="h-4 w-4 mr-1.5" />Duyệt</>}
            </Button>
            <Button
              variant="outline"
              onClick={() => setRejectOpen(true)}
              className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Từ chối
            </Button>
          </ResponsiveDialogFooter>
        )}
      </ResponsiveDialogContent>

      {/* Reject with reason */}
      <ResponsiveAlertDialog open={rejectOpen} onOpenChange={(v) => !rejecting && !v && closeReject()}>
        <ResponsiveAlertDialogContent>
          <ResponsiveAlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 shrink-0 place-items-center items-center justify-center mx-auto rounded-xl bg-rose-50 dark:bg-rose-500/10">
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <ResponsiveAlertDialogTitle>Từ chối tài khoản</ResponsiveAlertDialogTitle>
            <ResponsiveAlertDialogDescription>
              Từ chối duyệt <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{account.title}&quot;</span>. Người bán sẽ nhận email và có thể gửi lại sau khi chỉnh sửa.
            </ResponsiveAlertDialogDescription>
          </ResponsiveAlertDialogHeader>
          <div className="px-4 pb-2">
            <textarea
              placeholder="Nhập lý do từ chối (bắt buộc)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={rejecting}
              rows={3}
              className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <ResponsiveAlertDialogFooter>
            <Button variant="outline" onClick={closeReject} disabled={rejecting}>Hủy</Button>
            <Button
              onClick={handleReject}
              disabled={rejecting || !rejectReason.trim()}
              className="min-w-[7rem] bg-rose-600 text-white hover:bg-rose-700"
            >
              {rejecting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Đang từ chối...</> : "Từ chối"}
            </Button>
          </ResponsiveAlertDialogFooter>
        </ResponsiveAlertDialogContent>
      </ResponsiveAlertDialog>
    </ResponsiveDialog>
  );
}
