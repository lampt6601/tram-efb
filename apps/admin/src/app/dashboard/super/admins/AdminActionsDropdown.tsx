"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Pencil,
  KeyRound,
  Trash2,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  Mail,
  Check,
  Zap,
  Ban,
  Wallet,
  MessageCircle,
} from "lucide-react";
import {
  deleteAdmin,
  resetAdminPassword,
  updateAdminProfile,
  setAdminAutoApprove,
  setAdminDisabled,
  updateTransactionBoxUrl,
} from "@/app/actions/super-admin-actions";
import { Button } from "@thc-efb/ui/button";
import { Input } from "@thc-efb/ui/input";
import { Label } from "@thc-efb/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@thc-efb/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@thc-efb/ui/alert-dialog";
import { toast } from "sonner";
import { CollateralManageModal } from "./CollateralManageModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@thc-efb/ui/dropdown-menu";

interface AdminActionsDropdownProps {
  adminId: string;
  adminEmail: string;
  currentName: string;
  currentZaloName: string;
  accountCount: number;
  autoApprove: boolean;
  isDisabled: boolean;
  collateralAmount: number;
  transactionBoxUrl: string;
}

type OpenDialog = "editProfile" | "resetPassword" | "delete" | "collateral" | "transactionBox" | null;

export function AdminActionsDropdown({
  adminId,
  adminEmail,
  currentName,
  currentZaloName,
  accountCount,
  autoApprove: initialAutoApprove,
  isDisabled: initialIsDisabled,
  collateralAmount,
  transactionBoxUrl: initialTransactionBoxUrl,
}: AdminActionsDropdownProps) {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Edit profile state
  const [name, setName] = useState(currentName);
  const [zaloName, setZaloName] = useState(currentZaloName);

  // Reset password state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Copy email state
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Toggle states (for mobile dropdown)
  const [autoApprove, setAutoApprove] = useState(initialAutoApprove);
  const [isDisabled, setIsDisabled] = useState(initialIsDisabled);
  const [toggling, setToggling] = useState<"autoApprove" | "disable" | null>(null);

  // Transaction box state
  const [txBoxUrl, setTxBoxUrl] = useState(initialTransactionBoxUrl);

  const closeDialog = useCallback(() => {
    if (!loading) {
      setOpenDialog(null);
      setError("");
    }
  }, [loading]);

  const openWith = (dialog: OpenDialog) => {
    setError("");
    setLoading(false);
    if (dialog === "editProfile") {
      setName(currentName);
      setZaloName(currentZaloName);
    }
    if (dialog === "resetPassword") setPassword("");
    if (dialog === "transactionBox") setTxBoxUrl(initialTransactionBoxUrl);
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

  // ── Edit profile ───────────────────────────────────────────────────────────
  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Vui lòng nhập tên."); return; }
    setLoading(true);
    setError("");
    try {
      await updateAdminProfile(adminId, {
        name: name.trim(),
        zalo_name: zaloName.trim() || null,
      });
      toast.success("Đã cập nhật thông tin admin thành công");
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

  // ── Toggle auto approve (mobile dropdown) ────────────────────────────────
  const handleToggleAutoApprove = async () => {
    const next = !autoApprove;
    setToggling("autoApprove");
    try {
      await setAdminAutoApprove(adminId, next);
      setAutoApprove(next);
      toast.success(next ? `Đã bật auto duyệt cho ${adminEmail}` : `Đã tắt auto duyệt cho ${adminEmail}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally { setToggling(null); }
  };

  // ── Toggle disable (mobile dropdown) ────────────────────────────────────
  const handleToggleDisable = async () => {
    const next = !isDisabled;
    setToggling("disable");
    try {
      await setAdminDisabled(adminId, next);
      setIsDisabled(next);
      toast.success(next ? `Đã vô hiệu hóa ${adminEmail}` : `Đã kích hoạt lại ${adminEmail}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally { setToggling(null); }
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

  // ── Update transaction box URL ────────────────────────────────────────────
  const handleUpdateTransactionBox = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await updateTransactionBoxUrl(adminId, txBoxUrl.trim() || null);
      toast.success("Đã cập nhật link Box Giao Dịch");
      setOpenDialog(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* ── Dropdown ─────────────────────────────────────────────────────── */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100">
              Tác vụ
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          {/* Toggle items — visible on mobile only (hidden columns on md+) */}
          <div className="md:hidden">
            <DropdownMenuItem
              onClick={handleToggleAutoApprove}
              disabled={toggling !== null}
              className="gap-2"
            >
              {toggling === "autoApprove" ? (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
              ) : (
                <Zap className={`h-4 w-4 ${autoApprove ? "fill-emerald-500 text-emerald-500" : "text-slate-400"}`} />
              )}
              {autoApprove ? "Tắt auto duyệt" : "Bật auto duyệt"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleToggleDisable}
              disabled={toggling !== null}
              className="gap-2"
            >
              {toggling === "disable" ? (
                <Loader2 className="h-4 w-4 animate-spin text-red-500" />
              ) : (
                <Ban className={`h-4 w-4 ${isDisabled ? "text-red-500" : "text-slate-400"}`} />
              )}
              {isDisabled ? "Kích hoạt lại" : "Vô hiệu hóa"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </div>

          <DropdownMenuItem onClick={() => openWith("editProfile")} className="gap-2">
            <Pencil className="h-4 w-4 text-slate-400" />
            Chỉnh sửa thông tin
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
          <DropdownMenuItem onClick={() => openWith("transactionBox")} className="gap-2">
            <MessageCircle className="h-4 w-4 text-emerald-500" />
            Box Giao Dịch
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openWith("collateral")} className="gap-2">
            <Wallet className="h-4 w-4 text-amber-500" />
            Quản lý ký quỹ
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

      {/* ── Edit profile dialog ─────────────────────────────────────────── */}
      <Dialog open={openDialog === "editProfile"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-0 gap-0">
          <form onSubmit={handleEditProfile}>
            <div className="p-5">
              <DialogHeader className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                    <Pencil className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-semibold">Chỉnh Sửa Thông Tin</DialogTitle>
                    <DialogDescription className="max-w-[200px] truncate text-xs">{adminEmail}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-700 dark:text-slate-200">Tên Admin</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    disabled={loading}
                    className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                    autoFocus
                  />
                </div>
                <div>
                  <Label className="text-slate-700 dark:text-slate-200">Tên Zalo</Label>
                  <Input
                    type="text"
                    value={zaloName}
                    onChange={(e) => setZaloName(e.target.value)}
                    placeholder="Tên hiển thị trên Zalo"
                    disabled={loading}
                    className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                  />
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Để trống sẽ dùng tên admin.</p>
                </div>
              </div>
              {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
              <Button
                type="submit"
                loading={loading}
                loadingLabel="Đang lưu..."
                className="min-w-[6rem] bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Reset password dialog ──────────────────────────────────────────── */}
      <Dialog open={openDialog === "resetPassword"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-0 gap-0">
          <form onSubmit={handleResetPassword}>
            <div className="p-5">
              <DialogHeader className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
                    <KeyRound className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-semibold">Đổi Mật Khẩu</DialogTitle>
                    <DialogDescription className="max-w-[200px] truncate text-xs">{adminEmail}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <Label className="text-slate-700 dark:text-slate-200">Mật Khẩu Mới</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  disabled={loading}
                  className="rounded-xl border-slate-300 pr-10 dark:border-slate-600"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
              <Button
                type="submit"
                loading={loading}
                loadingLabel="Đang lưu..."
                className="min-w-[6rem] bg-slate-800 text-white hover:bg-slate-900"
              >
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ──────────────────────────────────────────────────── */}
      <AlertDialog open={openDialog === "delete"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle>Xóa tài khoản admin</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa admin{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">{adminEmail}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {accountCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Admin này có <span className="font-semibold">{accountCount} tài khoản</span> và các email liên kết. Tất cả sẽ được chuyển về cho Owner trước khi xóa.
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
            <Button
              onClick={handleDelete}
              loading={loading}
              loadingLabel="Đang xóa..."
              className="min-w-[8rem] bg-red-600 text-white hover:bg-red-700"
            >
              Xóa Admin
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Transaction Box dialog ──────────────────────────────────────── */}
      <Dialog open={openDialog === "transactionBox"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-0 gap-0">
          <form onSubmit={handleUpdateTransactionBox}>
            <div className="p-5">
              <DialogHeader className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                    <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-semibold">Box Giao Dịch</DialogTitle>
                    <DialogDescription className="max-w-[200px] truncate text-xs">{adminEmail}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <Label className="text-slate-700 dark:text-slate-200">Link Box Giao Dịch</Label>
              <Input
                type="url"
                value={txBoxUrl}
                onChange={(e) => setTxBoxUrl(e.target.value)}
                placeholder="https://zalo.me/g/..."
                disabled={loading}
                className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                autoFocus
              />
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                Zalo group giữa Chủ Sàn và người bán. Khách mua sẽ join vào box này.
              </p>
              {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
              <Button
                type="submit"
                loading={loading}
                loadingLabel="Đang lưu..."
                className="min-w-[6rem] bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Collateral modal ─────────────────────────────────────────────── */}
      <CollateralManageModal
        open={openDialog === "collateral"}
        onClose={closeDialog}
        adminId={adminId}
        adminEmail={adminEmail}
        currentAmount={collateralAmount}
      />
    </>
  );
}
