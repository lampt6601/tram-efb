"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteAdmin } from "@/app/actions/super-admin-actions";
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

export function DeleteAdminButton({ adminId, adminEmail, accountCount }: { adminId: string; adminEmail: string; accountCount: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const onClose = useCallback(() => { if (!loading) setOpen(false); }, [loading]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteAdmin(adminId);
      setOpen(false);
      toast.success(`Đã xóa admin ${adminEmail}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
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
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <ResponsiveAlertDialogTitle>Xóa tài khoản admin</ResponsiveAlertDialogTitle>
            <ResponsiveAlertDialogDescription>
              Bạn có chắc muốn xóa admin <span className="font-semibold text-slate-900 dark:text-slate-100">{adminEmail}</span>?
            </ResponsiveAlertDialogDescription>
          </ResponsiveAlertDialogHeader>
          {accountCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Admin này có <span className="font-semibold">{accountCount} tài khoản</span> và các email liên kết. Tất cả sẽ được chuyển về cho Owner trước khi xóa.
              </p>
            </div>
          )}
          <ResponsiveAlertDialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
            <Button
              onClick={handleDelete}
              loading={loading}
              loadingLabel="Đang xóa..."
              className="min-w-[8rem] bg-red-600 text-white hover:bg-red-700"
            >
              Xóa Admin
            </Button>
          </ResponsiveAlertDialogFooter>
        </ResponsiveAlertDialogContent>
      </ResponsiveAlertDialog>
    </>
  );
}
