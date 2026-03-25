"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  Pencil,
  RotateCcw,
  Trash2,
  Loader2,
  X,
  ExternalLink,
  Eye,
  UserPlus,
  Link as LinkIcon,
  Check,
  CheckCircle,
  Star,
  Copy,
  Tag,
  ShoppingCart,
} from "lucide-react";
import {
  unapproveAccount,
  superAdminDeleteAccount,
  approveAccount,
  superAdminUpdateAccount,
  copyAccountToAdmin,
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
import { PendingAccountDrawer } from "@/app/admin/dashboard/super/pending/PendingAccountDrawer";
import type { AccountWithEmail } from "@/types/database";

interface SuperAccountActionsDropdownProps {
  account: AccountWithEmail;
  adminEmail: string;
  adminOptions: Array<{ id: string; label: string }>;
  isApproved: boolean;
  isSold: boolean;
}

type OpenDialog = "sell" | "sale" | "copy" | "unapprove" | "delete" | "unmark-sold" | null;

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
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-black/10 dark:bg-slate-800 dark:ring-white/10">
        {children}
      </div>
    </div>,
    document.body
  );
}

export function SuperAccountActionsDropdown({
  account,
  adminEmail,
  adminOptions,
  isApproved,
  isSold,
}: SuperAccountActionsDropdownProps) {
  const id = account.id;
  const title = account.title;
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState<"priority" | "clone" | null>(null);
  const [priority, setPriority] = useState(account.is_priority ?? false);
  const [clone, setClone] = useState(account.is_clone ?? false);

  useEffect(() => {
    setPriority(account.is_priority ?? false);
  }, [account.is_priority]);

  useEffect(() => {
    setClone(account.is_clone ?? false);
  }, [account.is_clone]);
  const [sellPrice, setSellPrice] = useState(account.selling_price.toString());
  const [saleOriginalPrice, setSaleOriginalPrice] = useState(
    account.original_price ? account.original_price.toString() : account.selling_price.toString()
  );
  const [salePrice, setSalePrice] = useState(account.selling_price.toString());
  const [targetAdminId, setTargetAdminId] = useState("");
  const isOnSale = !!(account.original_price && account.original_price > account.selling_price);

  const closeDialog = useCallback(() => {
    if (!loading) setOpenDialog(null);
  }, [loading]);

  const openWith = (dialog: OpenDialog) => {
    setError("");
    setLoading(false);
    if (dialog === "sell") setSellPrice(account.selling_price.toString());
    if (dialog === "sale") {
      setSaleOriginalPrice(
        account.original_price ? account.original_price.toString() : account.selling_price.toString()
      );
      setSalePrice(account.selling_price.toString());
    }
    if (dialog === "copy") {
      const firstAdminId = adminOptions[0]?.id ?? "";
      setTargetAdminId(firstAdminId);
    }
    setOpenDialog(dialog);
  };

  const handleCopyToAdmin = async () => {
    if (!targetAdminId) {
      setError("Vui lòng chọn admin nhận tài khoản.");
      return;
    }
    if (targetAdminId === account.user_id) {
      setError("Vui lòng chọn admin khác với admin hiện tại.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await copyAccountToAdmin(id, targetAdminId);
      setOpenDialog(null);
      toast.success("Đã copy tài khoản cho admin khác (ở trạng thái chờ duyệt).");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // ── Copy link ─────────────────────────────────────────────────────────────
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://thc-efb.com/accounts/${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveAccount(id);
      toast.success(`Đã duyệt tài khoản "${title}"`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally { setApproving(false); }
  };

  // ── Unapprove ─────────────────────────────────────────────────────────────
  const handleUnapprove = async () => {
    setLoading(true);
    try {
      await unapproveAccount(id);
      toast.success(`Đã chuyển "${title}" về chờ duyệt`);
      setOpenDialog(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setLoading(true);
    try {
      await superAdminDeleteAccount(id);
      toast.success("Đã xóa tài khoản");
      setOpenDialog(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  // ── Toggle priority ───────────────────────────────────────────────────────
  const handleTogglePriority = async () => {
    const next = !priority;
    setToggling("priority");
    try {
      await superAdminUpdateAccount(id, account.user_id, { is_priority: next });
      setPriority(next);
      toast.success(next ? "Đã đánh dấu nổi bật" : "Đã bỏ nổi bật");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally { setToggling(null); }
  };

  // ── Toggle clone ──────────────────────────────────────────────────────────
  const handleToggleClone = async () => {
    const next = !clone;
    setToggling("clone");
    try {
      await superAdminUpdateAccount(id, account.user_id, { is_clone: next });
      setClone(next);
      toast.success(next ? "Đã đánh dấu Clone" : "Đã bỏ Clone");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally { setToggling(null); }
  };

  // ── Sell ──────────────────────────────────────────────────────────────────
  const handleSell = async () => {
    const parsed = parseFloat(sellPrice);
    if (isNaN(parsed) || parsed < 0) {
      setError("Vui lòng nhập giá bán hợp lệ.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await superAdminUpdateAccount(id, account.user_id, {
        status: "Sold",
        selling_price: parsed,
        email_id: null,
      });
      setOpenDialog(null);
      toast.success("Đã đánh dấu đã bán");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  // ── Sale ──────────────────────────────────────────────────────────────────
  const handleSaleConfirm = async () => {
    const parsedOriginal = parseFloat(saleOriginalPrice);
    const parsedSale = parseFloat(salePrice);
    if (isNaN(parsedSale) || parsedSale < 0) {
      setError("Vui lòng nhập giá Sale hợp lệ.");
      return;
    }
    if (saleOriginalPrice !== "" && (isNaN(parsedOriginal) || parsedOriginal <= parsedSale)) {
      setError("Giá gạch phải lớn hơn Giá Sale.");
      return;
    }
    const finalOriginal = saleOriginalPrice !== "" ? parsedOriginal : null;
    setLoading(true);
    setError("");
    try {
      await superAdminUpdateAccount(id, account.user_id, {
        selling_price: parsedSale,
        original_price: finalOriginal,
      });
      setOpenDialog(null);
      toast.success("Đã cập nhật giá sale");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  const handleRemoveSale = async () => {
    setLoading(true);
    setError("");
    try {
      await superAdminUpdateAccount(id, account.user_id, { original_price: null });
      setOpenDialog(null);
      toast.success("Đã hủy sale");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  // ── Unmark sold ───────────────────────────────────────────────────────────
  const handleUnmarkSold = async () => {
    setLoading(true);
    setError("");
    try {
      await superAdminUpdateAccount(id, account.user_id, { status: "Available" });
      setOpenDialog(null);
      toast.success("Đã gỡ đánh dấu đã bán");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
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
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            render={
              <Link
                href={`/admin/dashboard/super/accounts/${id}/edit`}
                className="flex items-center gap-2"
              />
            }
          >
            <Pencil className="h-4 w-4 text-slate-400" />
            Chỉnh sửa
          </DropdownMenuItem>

          {isApproved && (
            <DropdownMenuItem
              render={
                <Link
                  href={`/accounts/${id}`}
                  target="_blank"
                  className="flex items-center gap-2"
                />
              }
            >
              <ExternalLink className="h-4 w-4 text-slate-400" />
              Xem trang công khai
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setDrawerOpen(true)} className="gap-2">
            <Eye className="h-4 w-4 text-indigo-400" />
            Xem chi tiết
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => openWith("copy")} className="gap-2">
            <UserPlus className="h-4 w-4 text-cyan-500" />
            Copy cho admin khác
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <LinkIcon className="h-4 w-4 text-slate-400" />
            )}
            {copied ? "Đã copy!" : "Copy link"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {!isSold && (
            <DropdownMenuItem onClick={handleTogglePriority} disabled={toggling !== null} className="gap-2">
              {toggling === "priority" ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              ) : (
                <Star className={`h-4 w-4 ${priority ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
              )}
              {priority ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleToggleClone} disabled={toggling !== null} className="gap-2">
            {toggling === "clone" ? (
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
            ) : (
              <Copy className={`h-4 w-4 ${clone ? "text-violet-500" : "text-slate-400"}`} />
            )}
            {clone ? "Bỏ Clone" : "Đánh dấu Clone"}
          </DropdownMenuItem>

          {!isSold && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openWith("sale")} className="gap-2">
                <Tag className="h-4 w-4 text-rose-400" />
                {isOnSale ? "Chỉnh giá sale" : "Thiết lập sale"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openWith("sell")} className="gap-2">
                <ShoppingCart className="h-4 w-4 text-green-500" />
                Đánh dấu đã bán
              </DropdownMenuItem>
            </>
          )}

          {isSold && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openWith("unmark-sold")} className="gap-2">
                <RotateCcw className="h-4 w-4 text-blue-500" />
                Gỡ đánh dấu đã bán
              </DropdownMenuItem>
            </>
          )}

          {!isApproved && !isSold && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleApprove}
                disabled={approving}
                className="gap-2"
              >
                {approving ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                )}
                {approving ? "Đang duyệt..." : "Duyệt tài khoản"}
              </DropdownMenuItem>
            </>
          )}

          {isApproved && !isSold && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openWith("unapprove")} className="gap-2">
                <RotateCcw className="h-4 w-4 text-amber-500" />
                Chờ duyệt lại
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => openWith("delete")}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Xóa tài khoản
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Unapprove modal ───────────────────────────────────────────────── */}
      <Modal open={openDialog === "copy"} onClose={closeDialog}>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-500/10">
              <UserPlus className="h-5 w-5 text-cyan-600" />
            </div>
            <button onClick={closeDialog} disabled={loading} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Copy cho admin khác</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Tạo một bản sao của tài khoản <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span> cho admin khác.
          </p>
          <Label className="mb-1.5 text-slate-700 dark:text-slate-200">Chọn admin nhận tài khoản</Label>
          <select
            value={targetAdminId}
            onChange={(e) => setTargetAdminId(e.target.value)}
            disabled={loading || adminOptions.length === 0}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            {adminOptions.length === 0 ? (
              <option value="">Không có admin khả dụng</option>
            ) : (
              adminOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))
            )}
          </select>
          {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Bản copy mới sẽ ở trạng thái <span className="font-semibold">Chờ duyệt</span> và không giữ email liên kết cũ.
          </p>
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800">
          <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
          <Button
            onClick={handleCopyToAdmin}
            loading={loading}
            loadingLabel="Đang copy..."
            disabled={adminOptions.length === 0}
            className="min-w-[10rem] bg-cyan-600 text-white hover:bg-cyan-700"
          >
            Xác nhận copy
          </Button>
        </div>
      </Modal>

      {/* ── Unapprove modal ───────────────────────────────────────────────── */}
      <Modal open={openDialog === "unapprove"} onClose={closeDialog}>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
              <RotateCcw className="h-5 w-5 text-amber-600" />
            </div>
            <button onClick={closeDialog} disabled={loading} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Chuyển về chờ duyệt</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tài khoản <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span> sẽ không còn hiển thị công khai và cần được duyệt lại.
          </p>
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800">
          <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
          <Button
            onClick={handleUnapprove}
            loading={loading}
            loadingLabel="Đang xử lý..."
            className="min-w-[8rem] bg-amber-600 text-white hover:bg-amber-700"
          >
            Xác nhận
          </Button>
        </div>
      </Modal>

      {/* ── Delete modal ──────────────────────────────────────────────────── */}
      <Modal open={openDialog === "delete"} onClose={closeDialog}>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <button onClick={closeDialog} disabled={loading} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Xóa tài khoản</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bạn có chắc muốn xóa{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span>? Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800">
          <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
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

      {/* ── Sell modal ───────────────────────────────────────────────────── */}
      <Modal open={openDialog === "sell"} onClose={closeDialog}>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-500/10">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <button onClick={closeDialog} disabled={loading} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Xác Nhận Bán Tài Khoản</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Giá dự kiến sẽ cập nhật thành giá bán thực tế. Email liên kết sẽ bị gỡ tự động.
          </p>
          <Label className="mb-1.5 text-slate-700 dark:text-slate-200">Giá Bán Thực Tế (VNĐ)</Label>
          <Input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            min={0}
            step={1}
            disabled={loading}
            className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
            autoFocus
          />
          {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800">
          <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
          <Button
            onClick={handleSell}
            loading={loading}
            loadingLabel="Đang xử lý..."
            className="min-w-[10rem] bg-green-600 text-white hover:bg-green-700"
          >
            Xác Nhận Bán
          </Button>
        </div>
      </Modal>

      {/* ── Sale modal ───────────────────────────────────────────────────── */}
      <Modal open={openDialog === "sale"} onClose={closeDialog}>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10">
              <Tag className="h-5 w-5 text-rose-600" />
            </div>
            <button onClick={closeDialog} disabled={loading} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Cài Đặt Khuyến Mãi (Sale)</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Thiết lập giá gốc và giá giảm để tạo hiệu ứng thẻ sale nổi bật.
          </p>
          <div className="space-y-3">
            <div>
              <Label className="text-slate-700 dark:text-slate-200">Giá Bị Gạch / Giá Gốc (VNĐ)</Label>
              <Input
                type="number"
                value={saleOriginalPrice}
                onChange={(e) => setSaleOriginalPrice(e.target.value)}
                min={0}
                step={1}
                disabled={loading}
                className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                placeholder="Để trống nếu không có"
              />
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-200">Giá Sale Bán Thực Tế (VNĐ)</Label>
              <Input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                min={0}
                step={1}
                disabled={loading}
                className="mt-1.5 rounded-xl border-rose-300 bg-rose-50/30 dark:border-rose-500/30 dark:bg-rose-500/10"
              />
            </div>
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>
        </div>
        <div className="rounded-b-xl border-t bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
            <Button
              onClick={handleSaleConfirm}
              loading={loading}
              loadingLabel="Đang xử lý..."
              className="min-w-[9rem] bg-rose-600 text-white hover:bg-rose-700"
            >
              Lưu Thay Đổi
            </Button>
          </div>
          {isOnSale && (
            <button
              onClick={handleRemoveSale}
              disabled={loading}
              className="mt-2 w-full rounded-lg py-1.5 text-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline disabled:opacity-50"
            >
              Hủy bỏ sale cho tài khoản này
            </button>
          )}
        </div>
      </Modal>

      {/* ── Unmark sold modal ─────────────────────────────────────────────── */}
      <Modal open={openDialog === "unmark-sold"} onClose={closeDialog}>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
            <button onClick={closeDialog} disabled={loading} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Gỡ đánh dấu đã bán</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tài khoản <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span> sẽ được chuyển về trạng thái Còn hàng.
          </p>
          {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800">
          <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
          <Button
            onClick={handleUnmarkSold}
            loading={loading}
            loadingLabel="Đang xử lý..."
            className="min-w-[8rem] bg-blue-600 text-white hover:bg-blue-700"
          >
            Xác nhận
          </Button>
        </div>
      </Modal>

      {/* ── Detail drawer ─────────────────────────────────────────────────── */}
      <PendingAccountDrawer
        account={account}
        adminEmail={adminEmail}
        showApproveButton
        controlledOpen={drawerOpen}
        onControlledClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
