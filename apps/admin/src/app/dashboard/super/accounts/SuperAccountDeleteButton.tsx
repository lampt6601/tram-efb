"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { superAdminDeleteAccount } from "@/app/actions/super-admin-actions";
import { Button } from "@thc-efb/ui/button";
import {
  ResponsiveAlertDialog,
  ResponsiveAlertDialogContent,
  ResponsiveAlertDialogHeader,
  ResponsiveAlertDialogTitle,
  ResponsiveAlertDialogDescription,
  ResponsiveAlertDialogFooter,
} from "@thc-efb/ui/responsive-alert-dialog";
import { toast } from "sonner";

export function SuperAccountDeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const onClose = useCallback(() => { if (!loading) setOpen(false); }, [loading]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await superAdminDeleteAccount(id);
      setOpen(false);
      toast.success("Đã xóa tài khoản");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20">
        <Trash2 className="h-3.5 w-3.5" /> Xóa
      </button>
      <ResponsiveAlertDialog open={open} onOpenChange={(v) => !loading && !v && onClose()}>
        <ResponsiveAlertDialogContent>
          <ResponsiveAlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 shrink-0 place-items-center items-center justify-center mx-auto rounded-xl bg-red-50 dark:bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <ResponsiveAlertDialogTitle>Xóa tài khoản</ResponsiveAlertDialogTitle>
            <ResponsiveAlertDialogDescription>
              Bạn có chắc muốn xóa <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span>? Hành động này không thể hoàn tác.
            </ResponsiveAlertDialogDescription>
          </ResponsiveAlertDialogHeader>
          <ResponsiveAlertDialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
            <Button
              onClick={handleDelete}
              loading={loading}
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
