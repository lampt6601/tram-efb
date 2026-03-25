"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { updateAdminProfile } from "@/app/actions/super-admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EditAdminNameModalProps {
  adminId: string;
  adminEmail: string;
  currentName: string;
}

export function EditAdminNameModal({ adminId, adminEmail, currentName }: EditAdminNameModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(currentName);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setName(currentName);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await updateAdminProfile(adminId, name.trim());
      toast.success(`Đã cập nhật tên admin thành công`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 rounded-lg border-slate-200 px-2.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-black/10 dark:bg-slate-800 dark:ring-white/10">
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                      <Pencil className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Chỉnh Sửa Tên</h2>
                      <p className="max-w-[200px] truncate text-xs text-slate-500 dark:text-slate-400">{adminEmail}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <Label className="text-slate-700 dark:text-slate-200">Tên Admin</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    disabled={loading}
                    className="mt-1.5 rounded-xl border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    autoFocus
                  />
                  {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  loadingLabel="Đang lưu..."
                  className="min-w-[6rem] bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Lưu
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
