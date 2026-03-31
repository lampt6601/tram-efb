"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { createAdmin } from "@/app/actions/super-admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function CreateAdminModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Vui lòng nhập email."); return; }
    if (password.length < 8) { setError("Mật khẩu phải có ít nhất 8 ký tự."); return; }
    setLoading(true); setError("");
    try {
      await createAdmin(email.trim(), password, name.trim() || undefined);
      toast.success(`Đã tạo admin ${name.trim() || email} thành công`);
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

      <Dialog open={open} onOpenChange={(v) => !loading && (v ? setOpen(true) : handleClose())}>
        <DialogContent showCloseButton={false} className="sm:max-w-md p-0 gap-0">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <DialogHeader className="mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                    <UserPlus className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-semibold">Tạo Tài Khoản Admin</DialogTitle>
                    <DialogDescription className="text-xs">Admin mới có thể đăng nhập ngay sau khi tạo</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-700 dark:text-slate-200">Tên</Label>
                  <Input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A" disabled={loading}
                    className="mt-1.5 rounded-xl border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100" autoFocus />
                </div>
                <div>
                  <Label className="text-slate-700 dark:text-slate-200">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com" disabled={loading}
                    className="mt-1.5 rounded-xl border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100" />
                </div>
                <div>
                  <Label className="text-slate-700 dark:text-slate-200">Mật Khẩu</Label>
                  <div className="relative mt-1.5">
                    <Input type={showPassword ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự" disabled={loading}
                      className="rounded-xl border-slate-300 pr-10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Hủy</Button>
              <Button
                type="submit"
                loading={loading}
                loadingLabel="Đang tạo..."
                className="min-w-[8rem] bg-amber-500 text-white hover:bg-amber-600"
              >
                Tạo Admin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
