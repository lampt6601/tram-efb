"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { resetAdminPassword } from "@/app/actions/super-admin-actions";
import { Button } from "@thc-efb/ui/button";
import { Input } from "@thc-efb/ui/input";
import { Label } from "@thc-efb/ui/label";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@thc-efb/ui/responsive-dialog";
import { toast } from "sonner";

export function ResetPasswordModal({ adminId, adminEmail }: { adminId: string; adminEmail: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => { if (!loading) { setOpen(false); setPassword(""); setError(""); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Mật khẩu phải có ít nhất 8 ký tự."); return; }
    setLoading(true); setError("");
    try {
      await resetAdminPassword(adminId, password);
      toast.success(`Đã đổi mật khẩu cho ${adminEmail}`);
      setOpen(false); setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
        <KeyRound className="h-3.5 w-3.5" /> Đổi MK
      </button>

      <ResponsiveDialog open={open} onOpenChange={(v) => !loading && (v ? setOpen(true) : handleClose())}>
        <ResponsiveDialogContent showCloseButton={false} className="sm:max-w-sm p-0 gap-0">
          <form onSubmit={handleSubmit}>
            <div className="px-5">
              <ResponsiveDialogHeader className="mb-4">
                <div className="flex h-10 w-10 shrink-0 place-items-center items-center justify-center mx-auto rounded-xl bg-slate-100 dark:bg-slate-700">
                  <KeyRound className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <ResponsiveDialogTitle className="text-base font-semibold">Đổi Mật Khẩu</ResponsiveDialogTitle>
                <ResponsiveDialogDescription className="text-xs truncate">{adminEmail}</ResponsiveDialogDescription>
              </ResponsiveDialogHeader>
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Mật Khẩu Mới</Label>
                <div className="relative mt-1.5">
                  <Input type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự" disabled={loading}
                    className="rounded-xl border-slate-300 pr-10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100" autoFocus />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
              </div>
            </div>
            <ResponsiveDialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Hủy</Button>
              <Button
                type="submit"
                loading={loading}
                loadingLabel="Đang lưu..."
                className="min-w-[6rem] bg-slate-800 text-white hover:bg-slate-900"
              >
                Lưu
              </Button>
            </ResponsiveDialogFooter>
          </form>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
