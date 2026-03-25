"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { superAdminDeleteAccount } from "@/app/actions/super-admin-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
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
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-black/10 dark:bg-slate-800 dark:ring-white/10">{children}</div>
    </div>,
    document.body
  );
}

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
      <Modal open={open} onClose={onClose}>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <button onClick={onClose} disabled={loading} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Xóa tài khoản</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bạn có chắc muốn xóa <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span>? Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button
            onClick={handleDelete}
            loading={loading}
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
