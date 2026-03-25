"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { changeMyPassword } from "@/app/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await changeMyPassword(currentPassword, newPassword);
      toast.success("Đã đổi mật khẩu thành công");
      clearForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    currentPassword && newPassword && confirmPassword && !loading;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
            <KeyRound className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Đổi Mật Khẩu</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cập nhật mật khẩu đăng nhập của bạn
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <Label className="text-slate-700 dark:text-slate-200">Mật khẩu hiện tại</Label>
          <div className="relative mt-1.5">
            <Input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setError("");
              }}
              placeholder="Nhập mật khẩu hiện tại"
              disabled={loading}
              className="rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              {showCurrent ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label className="text-slate-700 dark:text-slate-200">Mật khẩu mới</Label>
          <div className="relative mt-1.5">
            <Input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
              }}
              placeholder="Tối thiểu 6 ký tự"
              disabled={loading}
              className="rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              {showNew ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label className="text-slate-700 dark:text-slate-200">Xác nhận mật khẩu mới</Label>
          <Input
            type={showNew ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            placeholder="Nhập lại mật khẩu mới"
            disabled={loading}
            className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={!canSubmit}
            loading={loading}
            loadingLabel="Đang lưu..."
            className="min-w-[9rem] bg-slate-800 text-white hover:bg-slate-900"
          >
            <KeyRound className="h-4 w-4 shrink-0" />
            Đổi mật khẩu
          </Button>
        </div>
      </form>
    </div>
  );
}
