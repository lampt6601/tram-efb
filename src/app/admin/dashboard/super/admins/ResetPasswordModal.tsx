"use client";

import { useState } from "react";
import { KeyRound, X, Eye, EyeOff } from "lucide-react";
import { resetAdminPassword } from "@/app/actions/super-admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
        <KeyRound className="h-3.5 w-3.5" /> Đổi MK
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-black/10">
            <form onSubmit={handleSubmit}>
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <KeyRound className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Đổi Mật Khẩu</h2>
                      <p className="text-xs text-slate-500 truncate max-w-[160px]">{adminEmail}</p>
                    </div>
                  </div>
                  <button type="button" onClick={handleClose} disabled={loading}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
                </div>
                <div>
                  <Label className="text-slate-700">Mật Khẩu Mới</Label>
                  <div className="relative mt-1.5">
                    <Input type={showPassword ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự" disabled={loading}
                      className="rounded-xl border-slate-300 pr-10" autoFocus />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3">
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Hủy</Button>
                <Button
                  type="submit"
                  loading={loading}
                  loadingLabel="Đang lưu..."
                  className="min-w-[6rem] bg-slate-800 text-white hover:bg-slate-900"
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
