"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  ChevronDown,
  Pencil,
  Link as LinkIcon,
  Check,
  ShoppingCart,
  Tag,
  Trash2,
  Loader2,
  X,
  ExternalLink,
  Copy,
  RotateCcw,
  Eye,
  Star,
} from "lucide-react";
import type { AccountStatus, AccountWithEmail } from "@/types/database";
import { notifyAdminAction } from "@/app/actions/notify-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PendingAccountDrawer } from "@/app/admin/dashboard/super/pending/PendingAccountDrawer";
import { toggleAccountPriority } from "@/app/actions/account-actions";
import { toast } from "sonner";

interface AccountActionsDropdownProps {
  id: string;
  title: string;
  purchasePrice: number;
  currentSellingPrice: number;
  currentOriginalPrice: number | null;
  status: AccountStatus;
  isClone: boolean;
  account: AccountWithEmail;
  adminEmail: string;
}

type OpenDialog = "sell" | "sale" | "delete" | "unmark-sold" | null;

// ─── Simple portal modal (no @base-ui focus lock) ──────────────────────────
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
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-black/10">
        {children}
      </div>
    </div>,
    document.body,
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export function AccountActionsDropdown({
  id,
  title,
  purchasePrice,
  currentSellingPrice,
  currentOriginalPrice,
  status,
  isClone,
  account,
  adminEmail,
}: AccountActionsDropdownProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Copy link
  const [copied, setCopied] = useState(false);

  // Toggle states
  const [clone, setClone] = useState(isClone);
  const [priority, setPriority] = useState(account.is_priority ?? false);
  const [toggling, setToggling] = useState<"clone" | "priority" | null>(null);

  useEffect(() => {
    setPriority(account.is_priority ?? false);
  }, [account.is_priority, id]);

  const [sellPrice, setSellPrice] = useState(currentSellingPrice.toString());

  const [saleOriginalPrice, setSaleOriginalPrice] = useState(
    currentOriginalPrice
      ? currentOriginalPrice.toString()
      : currentSellingPrice.toString(),
  );
  const [salePrice, setSalePrice] = useState(currentSellingPrice.toString());

  const closeDialog = useCallback(() => {
    if (!loading) setOpenDialog(null);
  }, [loading]);

  const openWith = (dialog: OpenDialog) => {
    setError("");
    setLoading(false);
    if (dialog === "sell") setSellPrice(currentSellingPrice.toString());
    if (dialog === "sale") {
      setSaleOriginalPrice(
        currentOriginalPrice
          ? currentOriginalPrice.toString()
          : currentSellingPrice.toString(),
      );
      setSalePrice(currentSellingPrice.toString());
    }
    setOpenDialog(dialog);
  };

  // Copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `https://thc-efb.com/accounts/${id}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // ── Toggle clone ──────────────────────────────────────────────────────────
  const handleToggleClone = async () => {
    const next = !clone;
    setToggling("clone");
    try {
      const { error: err } = await supabase
        .from("accounts")
        .update({ is_clone: next })
        .eq("id", id);
      if (err) throw err;
      setClone(next);
      toast.success(next ? "Đã đánh dấu Clone" : "Đã bỏ Clone");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể cập nhật trạng thái Clone.");
    } finally {
      setToggling(null);
    }
  };

  // ── Toggle nổi bật (server: giới hạn 2 acc Available + nổi bật / admin) ───
  const handleTogglePriority = async () => {
    const next = !priority;
    setToggling("priority");
    try {
      await toggleAccountPriority(id);
      setPriority(next);
      toast.success(next ? "Đã đánh dấu nổi bật" : "Đã bỏ nổi bật");
      router.refresh();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Không thể cập nhật nổi bật.",
      );
    } finally {
      setToggling(null);
    }
  };

  // ── Unmark sold ───────────────────────────────────────────────────────────
  const handleUnmarkSold = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase
        .from("accounts")
        .update({ status: "Available" })
        .eq("id", id);
      if (err) throw err;
      try {
        await notifyAdminAction("UPDATE", title, undefined, id, account.primary_image_url);
      } catch {
        /* ignore */
      }
      toast.success("Đã gỡ đánh dấu đã bán");
      setOpenDialog(null);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // ── Sell ──────────────────────────────────────────────────────────────────
  const handleSell = async () => {
    const parsed = parseFloat(sellPrice);
    if (isNaN(parsed) || parsed < 0) {
      setError("Vui lòng nhập giá bán hợp lệ.");
      return;
    }
    const finalPrice = parsed;
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase
        .from("accounts")
        .update({ status: "Sold", selling_price: finalPrice, email_id: null })
        .eq("id", id);
      if (err) throw err;
      try {
        await notifyAdminAction("SELL", title, {
          purchasePrice,
          sellingPrice: finalPrice,
        }, id, account.primary_image_url);
      } catch {
        /* ignore */
      }
      toast.success("Đã đánh dấu bán thành công");
      setOpenDialog(null);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // ── Sale ──────────────────────────────────────────────────────────────────
  const handleSaleConfirm = async () => {
    const parsedOriginal = parseFloat(saleOriginalPrice);
    const parsedSale = parseFloat(salePrice);
    if (isNaN(parsedSale) || parsedSale < 0) {
      setError("Vui lòng nhập giá Sale hợp lệ.");
      return;
    }
    if (
      saleOriginalPrice !== "" &&
      (isNaN(parsedOriginal) || parsedOriginal <= parsedSale)
    ) {
      setError("Giá gạch phải lớn hơn Giá Sale.");
      return;
    }
    const finalSale = parsedSale;
    const finalOriginal = saleOriginalPrice !== "" ? parsedOriginal : null;
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase
        .from("accounts")
        .update({ selling_price: finalSale, original_price: finalOriginal })
        .eq("id", id);
      if (err) throw err;
      try {
        await notifyAdminAction("UPDATE_SALE", title, {
          purchasePrice,
          sellingPrice: finalSale,
          originalPrice: finalOriginal,
        }, id, account.primary_image_url);
      } catch {
        /* ignore */
      }
      toast.success("Đã cập nhật giá sale");
      setOpenDialog(null);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSale = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase
        .from("accounts")
        .update({ original_price: null })
        .eq("id", id);
      if (err) throw err;
      try {
        await notifyAdminAction("UPDATE_SALE", title, undefined, id, account.primary_image_url);
      } catch {
        /* ignore */
      }
      toast.success("Đã hủy sale");
      setOpenDialog(null);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setLoading(true);
    try {
      await supabase.from("accounts").delete().eq("id", id);
      try {
        await notifyAdminAction("DELETE", title, undefined, id, account.primary_image_url);
      } catch {
        /* ignore */
      }
      toast.success("Đã xóa tài khoản");
      setOpenDialog(null);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const isSold = status === "Sold";
  const isOnSale = !!(
    currentOriginalPrice && currentOriginalPrice > currentSellingPrice
  );

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
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            render={
              <Link
                href={`/admin/dashboard/accounts/${id}/edit`}
                className="flex items-center gap-2"
              />
            }
          >
            <Pencil className="h-4 w-4 text-slate-400" />
            Chỉnh sửa
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setDrawerOpen(true)} className="gap-2">
            <Eye className="h-4 w-4 text-indigo-400" />
            Xem chi tiết
          </DropdownMenuItem>

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

          <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <LinkIcon className="h-4 w-4 text-slate-400" />
            )}
            {copied ? "Đã copy!" : "Copy link"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleToggleClone}
            disabled={toggling !== null}
            className="gap-2"
          >
            {toggling === "clone" ? (
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
            ) : (
              <Copy className={`h-4 w-4 ${clone ? "text-violet-500" : "text-slate-400"}`} />
            )}
            {clone ? "Bỏ Clone" : "Đánh dấu Clone"}
          </DropdownMenuItem>

          {!isSold && (
            <DropdownMenuItem
              onClick={handleTogglePriority}
              disabled={toggling !== null}
              className="gap-2"
            >
              {toggling === "priority" ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              ) : (
                <Star
                  className={`h-4 w-4 ${priority ? "text-amber-500 fill-amber-500" : "text-slate-400"}`}
                />
              )}
              {priority ? "Bỏ nổi bật" : "Nổi bật"}
            </DropdownMenuItem>
          )}

          {!isSold && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openWith("sale")}
                className="gap-2"
              >
                <Tag className="h-4 w-4 text-rose-400" />
                {isOnSale ? "Chỉnh giá sale" : "Thiết lập sale"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openWith("sell")}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4 text-green-500" />
                Đánh dấu đã bán
              </DropdownMenuItem>
            </>
          )}

          {isSold && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openWith("unmark-sold")}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4 text-blue-500" />
                Gỡ đánh dấu đã bán
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

      {/* ── Detail drawer ─────────────────────────────────────────────────── */}
      <PendingAccountDrawer
        account={account}
        adminEmail={adminEmail}
        controlledOpen={drawerOpen}
        onControlledClose={() => setDrawerOpen(false)}
      />
      {/* ── Sell modal ───────────────────────────────────────────────────── */}
      <Modal open={openDialog === "sell"} onClose={closeDialog}>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <button
              onClick={closeDialog}
              disabled={loading}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900">
            Xác Nhận Bán Tài Khoản
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Giá dự kiến sẽ cập nhật thành giá bán thực tế. Email liên kết sẽ
            bị gỡ tự động.
          </p>
          <Label className="mb-1.5 text-slate-700">Giá Bán Thực Tế (VNĐ)</Label>
          <Input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            min="0"
            step="1"
            disabled={loading}
            className="mt-1.5 rounded-xl border-slate-300"
            autoFocus
          />
          {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3">
          <Button variant="outline" onClick={closeDialog} disabled={loading}>
            Hủy
          </Button>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
              <Tag className="h-5 w-5 text-rose-600" />
            </div>
            <button
              onClick={closeDialog}
              disabled={loading}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900">
            Cài Đặt Khuyến Mãi (Sale)
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Thiết lập giá gốc và giá giảm để tạo hiệu ứng thẻ sale nổi bật.
          </p>
          <div className="space-y-3">
            <div>
              <Label className="text-slate-700">Giá Bị Gạch / Giá Gốc (VNĐ)</Label>
              <Input
                type="number"
                value={saleOriginalPrice}
                onChange={(e) => setSaleOriginalPrice(e.target.value)}
                min="0"
                step="1"
                disabled={loading}
                className="mt-1.5 rounded-xl border-slate-300"
                placeholder="Để trống nếu không có"
              />
            </div>
            <div>
              <Label className="text-slate-700">Giá Sale Bán Thực Tế (VNĐ)</Label>
              <Input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                min="0"
                step="1"
                disabled={loading}
                className="mt-1.5 rounded-xl border-rose-300 bg-rose-50/30"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        </div>
        <div className="rounded-b-xl border-t bg-slate-50 px-5 py-3">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={loading}>
              Hủy
            </Button>
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
              className="mt-2 w-full rounded-lg py-1.5 text-center text-sm text-slate-500 hover:text-slate-700 hover:underline disabled:opacity-50"
            >
              Hủy bỏ sale cho tài khoản này
            </button>
          )}
        </div>
      </Modal>

      {/* ── Delete modal ─────────────────────────────────────────────────── */}
      <Modal open={openDialog === "delete"} onClose={closeDialog}>
        <div className="p-5">
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            Xóa tài khoản
          </h2>
          <p className="text-sm text-slate-500">
            Bạn có chắc chắn muốn xóa tài khoản{" "}
            <span className="font-semibold text-slate-900">&quot;{title}&quot;</span>?
            Hành động này không thể hoàn tác.
          </p>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3">
          <Button variant="outline" onClick={closeDialog} disabled={loading}>
            Hủy
          </Button>
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

      {/* ── Unmark sold modal ─────────────────────────────────────────────── */}
      <Modal open={openDialog === "unmark-sold"} onClose={closeDialog}>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
            <button
              onClick={closeDialog}
              disabled={loading}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900">
            Gỡ Đánh Dấu Đã Bán
          </h2>
          <p className="text-sm text-slate-500">
            Tài khoản <span className="font-semibold text-slate-900">&quot;{title}&quot;</span> sẽ được chuyển về trạng thái{" "}
            <span className="font-semibold text-slate-700">Đang bán</span>.
          </p>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t bg-slate-50 px-5 py-3">
          <Button variant="outline" onClick={closeDialog} disabled={loading}>
            Hủy
          </Button>
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
    </>
  );
}
