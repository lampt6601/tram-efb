"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ChevronDown, CheckCircle, Eye, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { approveAccount, superAdminDeleteAccount } from "@/app/actions/super-admin-actions";
import { openFacebookShare } from "@/lib/facebook-share";
import { PendingAccountDrawer } from "./PendingAccountDrawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AccountWithEmail } from "@/types/database";

interface PendingActionsDropdownProps {
  account: AccountWithEmail;
  adminEmail: string;
}

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-black/10 dark:bg-slate-800 dark:ring-white/10">
        {children}
      </div>
    </div>,
    document.body
  );
}

export function PendingActionsDropdown({ account, adminEmail }: PendingActionsDropdownProps) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const closeDelete = useCallback(() => {
    if (!deleting) setDeleteOpen(false);
  }, [deleting]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveAccount(account.id);
      toast.success(`Đã duyệt tài khoản "${account.title}"`, {
        description: "Chia sẻ acc này lên Facebook của bạn?",
        action: {
          label: "📤 Đăng Facebook",
          onClick: () =>
            openFacebookShare(account.id, account.title, account.selling_price),
        },
        duration: 10000,
      });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setApproving(false);
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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100">
              Tác vụ
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
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
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDrawerOpen(true)} className="gap-2">
            <Eye className="h-4 w-4 text-indigo-400" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Xóa tài khoản
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PendingAccountDrawer
        account={account}
        adminEmail={adminEmail}
        showApproveButton
        controlledOpen={drawerOpen}
        onControlledClose={() => setDrawerOpen(false)}
      />

      {/* ── Delete modal ──────────────────────────────────────────────────── */}
      <Modal open={deleteOpen} onClose={closeDelete}>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <button onClick={closeDelete} disabled={deleting} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Xóa tài khoản</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bạn có chắc muốn xóa{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{account.title}&quot;</span>? Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800">
          <Button variant="outline" onClick={closeDelete} disabled={deleting}>Hủy</Button>
          <Button
            onClick={handleDelete}
            loading={deleting}
            loadingLabel="Đang xóa..."
            className="min-w-[7rem] bg-red-600 text-white hover:bg-red-700"
          >
            Xóa
          </Button>
        </div>
      </Modal>
    </>
  );
}
