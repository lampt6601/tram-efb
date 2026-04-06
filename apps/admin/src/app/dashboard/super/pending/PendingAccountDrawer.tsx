"use client";

import { useState, useCallback } from "react";
import { Eye, X, XCircle, Loader2 } from "lucide-react";
import { StatusBadge } from "@thc-efb/ui/badge";
import { ApproveButton } from "./ApproveButton";
import { Button } from "@thc-efb/ui/button";
import { rejectAccount } from "@/app/actions/super-admin-actions";
import { toast } from "sonner";
import type { AccountWithEmail } from "@thc-efb/supabase/types";
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

interface PendingAccountDrawerProps {
  account: AccountWithEmail;
  adminEmail: string;
  showApproveButton?: boolean;
  controlledOpen?: boolean;
  onControlledClose?: () => void;
}

export function PendingAccountDrawer({
  account,
  adminEmail,
  showApproveButton = false,
  controlledOpen,
  onControlledClose,
}: PendingAccountDrawerProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const onOpenChange = (value: boolean) => {
    if (isControlled) {
      if (!value) onControlledClose?.();
    } else {
      setInternalOpen(value);
    }
  };

  const onClose = () => onOpenChange(false);

  const closeReject = useCallback(() => {
    if (!rejecting) setRejectOpen(false);
  }, [rejecting]);

  const handleReject = async () => {
    setRejecting(true);
    try {
      await rejectAccount(account.id);
      toast.success(`Đã từ chối tài khoản "${account.title}"`);
      setRejectOpen(false);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setRejecting(false);
    }
  };

  const canShowApproveButton =
    showApproveButton && !account.is_approved && account.status !== "Sold";

  return (
    <>
      {!isControlled && (
        <button
          onClick={() => setInternalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
        >
          <Eye className="h-3.5 w-3.5" />
          Chi tiết
        </button>
      )}

      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerPortal>
          <DrawerOverlay />
          <DrawerPrimitive.Content
            data-slot="drawer-content"
            className="fixed inset-y-0 right-0 z-[200] flex h-full w-full max-w-lg flex-col rounded-l-2xl bg-white shadow-2xl outline-none dark:bg-slate-800"
          >
          {/* Header */}
          <DrawerHeader className="justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DrawerTitle className="truncate">
                  {account.title}
                </DrawerTitle>
                <StatusBadge status={account.status} />
              </div>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                ID: {account.id.slice(0, 8)}…
              </p>
            </div>
            <DrawerClose className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300">
              <X className="h-5 w-5" />
            </DrawerClose>
          </DrawerHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            <AccountDetailContent account={account} adminName={adminEmail} />
          </div>

          {/* Footer with approve/reject buttons */}
          {canShowApproveButton && (
            <DrawerFooter className="flex-row gap-2">
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
                  onApproved={onClose}
                  fullWidth
                />
              </div>
            </DrawerFooter>
          )}
          </DrawerPrimitive.Content>
        </DrawerPortal>
      </Drawer>

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
    </>
  );
}
