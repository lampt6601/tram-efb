"use client";

import { useState, useCallback } from "react";
import { Eye, X, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { StatusBadge } from "@thc-efb/ui/badge";
import { Button } from "@thc-efb/ui/button";
import { reviewerApproveAccount, reviewerRejectAccount } from "@/app/actions/reviewer-actions";
import { toast } from "sonner";
import type { Account } from "@thc-efb/supabase/types";
import {
  ResponsiveAlertDialog,
  ResponsiveAlertDialogContent,
  ResponsiveAlertDialogHeader,
  ResponsiveAlertDialogTitle,
  ResponsiveAlertDialogDescription,
  ResponsiveAlertDialogFooter,
} from "@thc-efb/ui/responsive-alert-dialog";
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  DrawerOverlay,
  DrawerPortal,
} from "@thc-efb/ui/drawer";
import { Drawer as DrawerPrimitive } from "vaul";
import { AccountDetailContent } from "@/components/admin/AccountDetailContent";

type PendingAccount = Pick<Account,
  "id" | "title" | "selling_price" | "primary_image_url" | "status" | "user_id" | "created_at" | "images"
  | "total_gp" | "team_strength" | "server_region"
> & { seller_name?: string };

interface ReviewAccountDrawerProps {
  account: PendingAccount;
  onReviewed?: () => void;
}

export function ReviewAccountDrawer({ account, onReviewed }: ReviewAccountDrawerProps) {
  const [open, setOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
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
      setApproveOpen(false);
      setOpen(false);
      onReviewed?.();
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
      setOpen(false);
      onReviewed?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setRejecting(false);
    }
  };

  // Cast to AccountWithEmail-compatible shape for AccountDetailContent
  const accountForDetail = {
    ...account,
    purchase_price: 0,
    original_price: null,
    total_coins_android: 0,
    total_coins_ios: 0,
    email_id: null,
    is_approved: false,
    is_rejected: false,
    is_priority: false,
    is_clone: false,
    updated_at: account.created_at,
    emails: null,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
      >
        <Eye className="h-3.5 w-3.5" />
        Xem & Duyệt
      </button>

      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerPortal>
          <DrawerOverlay />
          <DrawerPrimitive.Content
            data-slot="drawer-content"
            className="fixed inset-y-0 right-0 z-[200] flex h-full w-full max-w-lg flex-col rounded-l-2xl bg-white shadow-2xl outline-none dark:bg-slate-800"
          >
            <DrawerHeader className="justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <DrawerTitle className="truncate">{account.title}</DrawerTitle>
                  <StatusBadge status={account.status} />
                </div>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  {account.seller_name && <span className="font-medium">{account.seller_name} · </span>}
                  ID: {account.id.slice(0, 8)}…
                </p>
              </div>
              <DrawerClose className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </DrawerClose>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto">
              <AccountDetailContent account={accountForDetail} adminName={account.seller_name ?? ""} />
            </div>

            <DrawerFooter className="flex-col gap-2">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setApproveOpen(true)}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Duyệt
              </Button>
              <Button
                variant="outline"
                className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                onClick={() => setRejectOpen(true)}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Từ chối
              </Button>
            </DrawerFooter>
          </DrawerPrimitive.Content>
        </DrawerPortal>
      </Drawer>

      {/* Approve confirmation */}
      <ResponsiveAlertDialog open={approveOpen} onOpenChange={(v) => !approving && setApproveOpen(v)}>
        <ResponsiveAlertDialogContent>
          <ResponsiveAlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <ResponsiveAlertDialogTitle>Duyệt tài khoản</ResponsiveAlertDialogTitle>
            <ResponsiveAlertDialogDescription>
              Duyệt <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{account.title}&quot;</span>?
              Tài khoản sẽ hiển thị công khai trên shop và người bán sẽ nhận được email thông báo.
            </ResponsiveAlertDialogDescription>
          </ResponsiveAlertDialogHeader>
          <ResponsiveAlertDialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={approving}>Hủy</Button>
            <Button
              onClick={handleApprove}
              disabled={approving}
              className="min-w-[7rem] bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {approving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Đang duyệt...</> : "Duyệt"}
            </Button>
          </ResponsiveAlertDialogFooter>
        </ResponsiveAlertDialogContent>
      </ResponsiveAlertDialog>

      {/* Reject with reason */}
      <ResponsiveAlertDialog open={rejectOpen} onOpenChange={(v) => !rejecting && !v && closeReject()}>
        <ResponsiveAlertDialogContent>
          <ResponsiveAlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center mx-auto rounded-xl bg-rose-50 dark:bg-rose-500/10">
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <ResponsiveAlertDialogTitle>Từ chối tài khoản</ResponsiveAlertDialogTitle>
            <ResponsiveAlertDialogDescription>
              Từ chối duyệt <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{account.title}&quot;</span>.
              Người bán sẽ nhận email thông báo và có thể gửi lại sau khi chỉnh sửa.
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
    </>
  );
}
