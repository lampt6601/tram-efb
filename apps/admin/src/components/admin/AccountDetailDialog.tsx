"use client";

import { useState, useCallback } from "react";
import { XCircle, Loader2 } from "lucide-react";
import { StatusBadge } from "@thc-efb/ui/badge";
import { Button } from "@thc-efb/ui/button";
import { toast } from "sonner";
import type { AccountWithEmail } from "@thc-efb/supabase/types";
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
import { ApproveButton } from "@/app/dashboard/super/pending/ApproveButton";
import { rejectAccount } from "@/app/actions/super-admin-actions";
import { AccountDetailContent } from "./AccountDetailContent";

interface AccountDetailDialogProps {
  account: AccountWithEmail;
  adminName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showApproveButton?: boolean;
}

export function AccountDetailDialog({
  account,
  adminName,
  open,
  onOpenChange,
  showApproveButton = false,
}: AccountDetailDialogProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const closeReject = useCallback(() => {
    if (!rejecting) setRejectOpen(false);
  }, [rejecting]);

  const handleReject = async () => {
    setRejecting(true);
    try {
      await rejectAccount(account.id);
      toast.success(`Đã từ chối tài khoản "${account.title}"`);
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
              ID: {account.id.slice(0, 8)}…
            </span>
          </div>
          <ResponsiveDialogTitle className="text-base font-semibold leading-snug">
            {account.title}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="sr-only">
            Chi tiết tài khoản {account.title}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <AccountDetailContent account={account} adminName={adminName} />
        </div>

        {showApproveButton && !account.is_approved && account.status !== "Sold" && (
          <ResponsiveDialogFooter className="shrink-0 px-5 pb-5 pt-3 flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
              onClick={() => setRejectOpen(true)}
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Từ chối
            </Button>
            <div className="flex-1">
              <ApproveButton
                accountId={account.id}
                accountTitle={account.title}
                sellingPrice={account.selling_price}
                onApproved={() => onOpenChange(false)}
                fullWidth
              />
            </div>
          </ResponsiveDialogFooter>
        )}
      </ResponsiveDialogContent>

      {/* Reject confirmation */}
      <ResponsiveAlertDialog open={rejectOpen} onOpenChange={(v) => !rejecting && !v && closeReject()}>
        <ResponsiveAlertDialogContent>
          <ResponsiveAlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 shrink-0 place-items-center items-center justify-center mx-auto rounded-xl bg-rose-50 dark:bg-rose-500/10">
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <ResponsiveAlertDialogTitle>Từ chối tài khoản</ResponsiveAlertDialogTitle>
            <ResponsiveAlertDialogDescription>
              Từ chối duyệt <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{account.title}&quot;</span>? Người bán vẫn có thể chỉnh sửa lại để gửi duyệt.
            </ResponsiveAlertDialogDescription>
          </ResponsiveAlertDialogHeader>
          <ResponsiveAlertDialogFooter>
            <Button variant="outline" onClick={closeReject} disabled={rejecting}>Hủy</Button>
            <Button
              onClick={handleReject}
              disabled={rejecting}
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
