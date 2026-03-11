"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Loader2, Eye, EyeOff } from "lucide-react";
import { createAdmin } from "@/app/actions/super-admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function CreateAdminModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => { if (!loading) { setOpen(false); setEmail(""); setPassword(""); setError(""); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Vui lòng nhập email."); return; }
    if (password.length < 6) { setError("Mật khẩu phải có ít nhất 6 ký tự."); return; }
    setLoading(true); setError("");
    try {
      await createAdmin(email.trim(), password);
      toast.success(`Đã tạo admin ${email} thành công`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-amber-500 text-white hover:bg-amber-600">
        <UserPlus className="h-4 w-4" /> Thêm Admin
      </Button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl ring-1 ring-black/10">
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                      <UserPlus className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Tạo Tài Khoản Admin</h2>
                      <p className="text-xs text-slate-500">Admin mới có thể đăng nhập ngay sau khi tạo</p>
                    </div>
                  </div>
                  <button type="button" onClick={handleClose} disabled={loading}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-700">Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com" disabled={loading}
                      className="mt-1.5 rounded-xl border-slate-300" autoFocus />
                  </div>
                  <div>
                    <Label className="text-slate-700">Mật Khẩu</Label>
                    <div className="relative mt-1.5">
                      <Input type={showPassword ? "text" : "password"} value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự" disabled={loading}
                        className="rounded-xl border-slate-300 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-6 py-4">
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Hủy</Button>
                <Button type="submit" disabled={loading} className="bg-amber-500 text-white hover:bg-amber-600">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Đang tạo..." : "Tạo Admin"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
