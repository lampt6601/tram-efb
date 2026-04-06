"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, CheckCircle, Eye, Loader2, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approveAccount, rejectAccount, superAdminDeleteAccount } from "@/app/actions/super-admin-actions";
import { PendingAccountDrawer } from "./PendingAccountDrawer";
import { Button } from "@thc-efb/ui/button";
import {
  ResponsiveDropdownMenu,
  ResponsiveDropdownMenuContent,
  ResponsiveDropdownMenuItem,
  ResponsiveDropdownMenuSeparator,
  ResponsiveDropdownMenuTrigger,
} from "@thc-efb/ui/responsive-dropdown-menu";
import {
  ResponsiveAlertDialog,
  ResponsiveAlertDialogContent,
  ResponsiveAlertDialogHeader,
  ResponsiveAlertDialogTitle,
  ResponsiveAlertDialogDescription,
  ResponsiveAlertDialogFooter,
} from "@thc-efb/ui/responsive-alert-dialog";
import type { AccountWithEmail } from "@thc-efb/supabase/types";

interface PendingActionsDropdownProps {
  account: AccountWithEmail;
  adminEmail: string;
}

export function PendingActionsDropdown({ account, adminEmail }: PendingActionsDropdownProps) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const closeDelete = useCallback(() => {
    if (!deleting) setDeleteOpen(false);
  }, [deleting]);

  const closeReject = useCallback(() => {
    if (!rejecting) setRejectOpen(false);
  }, [rejecting]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveAccount(account.id);
      toast.success(`Đã duyệt tài khoản "${account.title}"`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await rejectAccount(account.id);
      toast.success(`Đã từ chối tài khoản "${account.title}"`);
      setRejectOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setRejecting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await superAdminDeleteAccount(account.id);
      toast.success(`Đã xóa tài khoản "${account.title}"`);
      setDeleteOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <ResponsiveDropdownMenu>
        <ResponsiveDropdownMenuTrigger
          render={
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100">
              Tác vụ
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          }
        />
        <ResponsiveDropdownMenuContent align="end" className="w-44">
          <ResponsiveDropdownMenuItem
            onClick={handleApprove}
            disabled={approving}
            className="gap-2"
          >
            {approving ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            )}
            {approving ? "Đang duyệt..." : "Duyệt tài khoản"}
          </ResponsiveDropdownMenuItem>
          <ResponsiveDropdownMenuItem
            onClick={() => setRejectOpen(true)}
            className="gap-2 text-rose-600 dark:text-rose-400"
          >
            <XCircle className="h-4 w-4" />
            Từ chối
          </ResponsiveDropdownMenuItem>
          <ResponsiveDropdownMenuItem onClick={() => setDrawerOpen(true)} className="gap-2">
            <Eye className="h-4 w-4 text-indigo-400" />
            Xem chi tiết
          </ResponsiveDropdownMenuItem>
          <ResponsiveDropdownMenuSeparator />
          <ResponsiveDropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Xóa tài khoản
          </ResponsiveDropdownMenuItem>
        </ResponsiveDropdownMenuContent>
      </ResponsiveDropdownMenu>

      <PendingAccountDrawer
        account={account}
        adminEmail={adminEmail}
        showApproveButton
        controlledOpen={drawerOpen}
        onControlledClose={() => setDrawerOpen(false)}
      />

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
              loading={rejecting}
              loadingLabel="Đang từ chối..."
              className="min-w-[7rem] bg-rose-600 text-white hover:bg-rose-700"
            >
              Từ chối
            </Button>
          </ResponsiveAlertDialogFooter>
        </ResponsiveAlertDialogContent>
      </ResponsiveAlertDialog>

      {/* Delete confirmation */}
      <ResponsiveAlertDialog open={deleteOpen} onOpenChange={(v) => !deleting && !v && closeDelete()}>
        <ResponsiveAlertDialogContent>
          <ResponsiveAlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 shrink-0 place-items-center items-center justify-center mx-auto rounded-xl bg-red-50 dark:bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <ResponsiveAlertDialogTitle>Xóa tài khoản</ResponsiveAlertDialogTitle>
            <ResponsiveAlertDialogDescription>
              Bạn có chắc muốn xóa <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{account.title}&quot;</span>? Hành động này không thể hoàn tác.
            </ResponsiveAlertDialogDescription>
          </ResponsiveAlertDialogHeader>
          <ResponsiveAlertDialogFooter>
            <Button variant="outline" onClick={closeDelete} disabled={deleting}>Hủy</Button>
            <Button
              onClick={handleDelete}
              loading={deleting}
              loadingLabel="Đang xóa..."
              className="min-w-[7rem] bg-red-600 text-white hover:bg-red-700"
            >
              Xóa
            </Button>
          </ResponsiveAlertDialogFooter>
        </ResponsiveAlertDialogContent>
      </ResponsiveAlertDialog>
    </>
  );
}
