"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Pencil,
  KeyRound,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  Mail,
  Check,
} from "lucide-react";
import {
  deleteAdmin,
  resetAdminPassword,
  updateAdminProfile,
} from "@/app/actions/super-admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminActionsDropdownProps {
  adminId: string;
  adminEmail: string;
  currentName: string;
  accountCount: number;
}

type OpenDialog = "editName" | "resetPassword" | "delete" | null;

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
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-black/10">
        {children}
      </div>
    </div>,
    document.body
  );
}

export function AdminActionsDropdown({
  adminId,
  adminEmail,
  currentName,
  accountCount,
}: AdminActionsDropdownProps) {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Edit name state
  const [name, setName] = useState(currentName);

  // Reset password state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Copy email state
  const [copiedEmail, setCopiedEmail] = useState(false);

  const closeDialog = useCallback(() => {
    if (!loading) {
      setOpenDialog(null);
      setError("");
    }
  }, [loading]);

  const openWith = (dialog: OpenDialog) => {
    setError("");
    setLoading(false);
    if (dialog === "editName") setName(currentName);
    if (dialog === "resetPassword") setPassword("");
    setOpenDialog(dialog);
  };

  // ── Copy email ────────────────────────────────────────────────────────────
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(adminEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // ignore
    }
  };

  // ── Edit name ─────────────────────────────────────────────────────────────
  const handleEditName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Vui lòng nhập tên."); return; }
    setLoading(true);
    setError("");
    try {
      await updateAdminProfile(adminId, name.trim());
      toast.success("Đã cập nhật tên admin thành công");
      setOpenDialog(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  // ── Reset password ────────────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Mật khẩu phải có ít nhất 8 ký tự."); return; }
    setLoading(true);
    setError("");
    try {
      await resetAdminPassword(adminId, password);
      toast.success(`Đã đổi mật khẩu cho ${adminEmail}`);
      setOpenDialog(null);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteAdmin(adminId);
      setOpenDialog(null);
      toast.success(`Đã xóa admin ${adminEmail}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* ── Dropdown ─────────────────────────────────────────────────────── */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Tác vụ
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => openWith("editName")} className="gap-2">
            <Pencil className="h-4 w-4 text-slate-400" />
            Chỉnh sửa tên
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyEmail} className="gap-2">
            {copiedEmail ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Mail className="h-4 w-4 text-slate-400" />
            )}
            {copiedEmail ? "Đã copy!" : "Copy email"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openWith("resetPassword")} className="gap-2">
            <KeyRound className="h-4 w-4 text-slate-400" />
            Đổi mật khẩu
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => openWith("delete")}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Xóa admin
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Edit name modal ───────────────────────────────────────────────── */}
      <Modal open={openDialog === "editName"} onClose={closeDialog}>
        <form onSubmit={handleEditName}>
          <div className="p-5">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <Pencil className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Chỉnh Sửa Tên</h2>
                  <p className="max-w-[200px] truncate text-xs text-slate-500">{adminEmail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                disabled={loading}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Label className="text-slate-700">Tên Admin</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              disabled={loading}
              className="mt-1.5 rounded-xl border-slate-300"
              autoFocus
            />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3">
            <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
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
      </Modal>

      {/* ── Reset password modal ──────────────────────────────────────────── */}
      <Modal open={openDialog === "resetPassword"} onClose={closeDialog}>
        <form onSubmit={handleResetPassword}>
          <div className="p-5">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <KeyRound className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Đổi Mật Khẩu</h2>
                  <p className="max-w-[200px] truncate text-xs text-slate-500">{adminEmail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                disabled={loading}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Label className="text-slate-700">Mật Khẩu Mới</Label>
            <div className="relative mt-1.5">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                disabled={loading}
                className="rounded-xl border-slate-300 pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3">
            <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
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
      </Modal>

      {/* ── Delete modal ──────────────────────────────────────────────────── */}
      <Modal open={openDialog === "delete"} onClose={closeDialog}>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <button onClick={closeDialog} disabled={loading} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900">Xóa tài khoản admin</h2>
          <p className="text-sm text-slate-500">
            Bạn có chắc muốn xóa admin{" "}
            <span className="font-semibold text-slate-900">{adminEmail}</span>?
          </p>
          {accountCount > 0 && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700">
                Admin này có <span className="font-semibold">{accountCount} tài khoản</span> và các email liên kết. Tất cả sẽ được chuyển về cho Owner trước khi xóa.
              </p>
            </div>
          )}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3">
          <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
          <Button
            onClick={handleDelete}
            loading={loading}
            loadingLabel="Đang xóa..."
            className="min-w-[8rem] bg-red-600 text-white hover:bg-red-700"
          >
            Xóa Admin
          </Button>
        </div>
      </Modal>
    </>
  );
}
