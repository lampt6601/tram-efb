"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@thc-efb/supabase/browser";
import {
  ChevronDown,
  Pencil,
  Link as LinkIcon,
  Check,
  ShoppingCart,
  Tag,
  Trash2,
  Loader2,
  ExternalLink,
  Copy,
  RotateCcw,
  Eye,
  Star,
  Banknote,
} from "lucide-react";
import type { AccountStatus, AccountWithEmail } from "@thc-efb/supabase/types";
import { notifyAdminAction } from "@/app/actions/notify-admin";
import { Button } from "@thc-efb/ui/button";
import { Input } from "@thc-efb/ui/input";
import { CurrencyInput } from "@thc-efb/ui/currency-input";
import { Label } from "@thc-efb/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@thc-efb/ui/dropdown-menu";
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
import { PendingAccountDrawer } from "@/app/dashboard/super/pending/PendingAccountDrawer";
import { AccountEditSheet } from "@/components/admin/AccountEditSheet";
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

type OpenDialog = "sell" | "sale" | "delete" | "unmark-sold" | "deposit" | "undeposit" | null;

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
  const [editSheetOpen, setEditSheetOpen] = useState(false);

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

  // Deposit states
  const [depositCustomerName, setDepositCustomerName] = useState(account.deposit_customer_name ?? "");
  const [depositCustomerContact, setDepositCustomerContact] = useState(account.deposit_customer_contact ?? "");
  const [depositAmount, setDepositAmount] = useState(account.deposit_amount?.toString() ?? "");
  const [depositHoldUntil, setDepositHoldUntil] = useState(account.deposit_hold_until?.split("T")[0] ?? "");
  const [depositNotes, setDepositNotes] = useState(account.deposit_notes ?? "");

  const closeDialog = useCallback(() => {
    if (!loading) setOpenDialog(null);
  }, [loading]);

  const openWith = (dialog: OpenDialog) => {
    setError("");
    setLoading(false);
    if (dialog === "sell") setSellPrice(currentSellingPrice.toString());
    if (dialog === "deposit") {
      setDepositCustomerName(account.deposit_customer_name ?? "");
      setDepositCustomerContact(account.deposit_customer_contact ?? "");
      setDepositAmount(account.deposit_amount?.toString() ?? "");
      setDepositHoldUntil(account.deposit_hold_until?.split("T")[0] ?? "");
      setDepositNotes(account.deposit_notes ?? "");
    }
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
    const parsed = Math.round(Number(sellPrice));
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
    const parsedOriginal = Math.round(Number(saleOriginalPrice));
    const parsedSale = Math.round(Number(salePrice));
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

  // ── Deposit ──────────────────────────────────────────────────────────────
  const handleDeposit = async () => {
    if (!depositCustomerName.trim()) {
      setError("Vui lòng nhập tên khách hàng.");
      return;
    }
    const parsedAmount = Math.round(Number(depositAmount));
    if (!depositAmount || isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Vui lòng nhập số tiền cọc hợp lệ.");
      return;
    }
    if (!depositHoldUntil) {
      setError("Vui lòng chọn ngày giữ acc.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase
        .from("accounts")
        .update({
          status: "Deposited",
          deposit_customer_name: depositCustomerName.trim(),
          deposit_customer_contact: depositCustomerContact.trim() || null,
          deposit_amount: parsedAmount,
          deposit_hold_until: depositHoldUntil,
          deposit_notes: depositNotes.trim() || null,
        })
        .eq("id", id);
      if (err) throw err;
      try {
        await notifyAdminAction("UPDATE", title, undefined, id, account.primary_image_url);
      } catch { /* ignore */ }
      toast.success("Đã đánh dấu cọc thành công");
      setOpenDialog(null);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // ── Undeposit ───────────────────────────────────────────────────────────
  const handleUndeposit = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase
        .from("accounts")
        .update({
          status: "Available",
          deposit_customer_name: null,
          deposit_customer_contact: null,
          deposit_amount: null,
          deposit_hold_until: null,
          deposit_notes: null,
        })
        .eq("id", id);
      if (err) throw err;
      try {
        await notifyAdminAction("UPDATE", title, undefined, id, account.primary_image_url);
      } catch { /* ignore */ }
      toast.success("Đã hủy cọc thành công");
      setOpenDialog(null);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const isSold = status === "Sold";
  const isDeposited = status === "Deposited";
  const isOnSale = !!(
    currentOriginalPrice && currentOriginalPrice > currentSellingPrice
  );

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
          <DropdownMenuItem onClick={() => setEditSheetOpen(true)} className="gap-2">
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

          <DropdownMenuItem
            render={
              <Link
                href={`/dashboard/accounts/new?from=${id}`}
                className="flex items-center gap-2"
              />
            }
          >
            <Copy className="h-4 w-4 text-slate-400" />
            Tạo acc tương tự
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

          {!isSold && !isDeposited && (
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
                onClick={() => openWith("deposit")}
                className="gap-2"
              >
                <Banknote className="h-4 w-4 text-blue-500" />
                Cọc acc
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

          {isDeposited && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openWith("undeposit")}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4 text-blue-500" />
                Hủy cọc
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

      {/* ── Edit sheet ──────────────────────────────────────────────────── */}
      <AccountEditSheet
        accountId={id}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
      />

      {/* ── Detail drawer ─────────────────────────────────────────────────── */}
      <PendingAccountDrawer
        account={account}
        adminEmail={adminEmail}
        controlledOpen={drawerOpen}
        onControlledClose={() => setDrawerOpen(false)}
      />

      {/* ── Sell dialog ───────────────────────────────────────────────────── */}
      <Dialog open={openDialog === "sell"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-0 gap-0">
          <div className="p-5">
            <DialogHeader className="mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-500/10">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <DialogTitle className="text-base font-semibold">Xác Nhận Bán Tài Khoản</DialogTitle>
              <DialogDescription>
                Giá dự kiến sẽ cập nhật thành giá bán thực tế. Email liên kết sẽ bị gỡ tự động.
              </DialogDescription>
            </DialogHeader>
            <Label className="mb-1.5 text-slate-700 dark:text-slate-200">Giá Bán Thực Tế</Label>
            <CurrencyInput
              value={sellPrice}
              onChange={setSellPrice}
              min={0}
              step={1}
              disabled={loading}
              className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
              autoFocus
            />
            {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>
          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Sale dialog ───────────────────────────────────────────────────── */}
      <Dialog open={openDialog === "sale"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-0 gap-0">
          <div className="p-5">
            <DialogHeader className="mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10">
                <Tag className="h-5 w-5 text-rose-600" />
              </div>
              <DialogTitle className="text-base font-semibold">Cài Đặt Khuyến Mãi (Sale)</DialogTitle>
              <DialogDescription>
                Thiết lập giá gốc và giá giảm để tạo hiệu ứng thẻ sale nổi bật.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Giá Bị Gạch / Giá Gốc</Label>
                <CurrencyInput
                  value={saleOriginalPrice}
                  onChange={setSaleOriginalPrice}
                  min={0}
                  step={1}
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                  placeholder="Để trống nếu không có"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Giá Sale Bán Thực Tế</Label>
                <CurrencyInput
                  value={salePrice}
                  onChange={setSalePrice}
                  min={0}
                  step={1}
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-rose-300 bg-rose-50/30 dark:border-rose-500/30 dark:bg-rose-500/10"
                />
              </div>
              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
          </div>
          <div className="border-t bg-muted/50 p-4">
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
                className="mt-2 w-full rounded-lg py-1.5 text-center text-sm text-slate-500 hover:text-slate-700 hover:underline disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Hủy bỏ sale cho tài khoản này
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ─────────────────────────────────────────────────── */}
      <AlertDialog open={openDialog === "delete"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <AlertDialogFooter>
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Deposit dialog ──────────────────────────────────────────────── */}
      <Dialog open={openDialog === "deposit"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-0 gap-0">
          <div className="p-5">
            <DialogHeader className="mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <Banknote className="h-5 w-5 text-blue-600" />
              </div>
              <DialogTitle className="text-base font-semibold">Cọc Tài Khoản</DialogTitle>
              <DialogDescription>
                Nhập thông tin khách cọc để giữ acc đến ngày hẹn.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Tên Khách Hàng *</Label>
                <Input
                  value={depositCustomerName}
                  onChange={(e) => setDepositCustomerName(e.target.value)}
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                  placeholder="VD: Nguyễn Văn A"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Liên Hệ (SĐT / Zalo / FB)</Label>
                <Input
                  value={depositCustomerContact}
                  onChange={(e) => setDepositCustomerContact(e.target.value)}
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                  placeholder="VD: 0901234567"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Số Tiền Cọc *</Label>
                <CurrencyInput
                  value={depositAmount}
                  onChange={setDepositAmount}
                  min={0}
                  step={1}
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-blue-300 bg-blue-50/30 dark:border-blue-500/30 dark:bg-blue-500/10"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Giữ Đến Ngày *</Label>
                <Input
                  type="date"
                  value={depositHoldUntil}
                  onChange={(e) => setDepositHoldUntil(e.target.value)}
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Ghi Chú</Label>
                <textarea
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  disabled={loading}
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:text-slate-200"
                  placeholder="Ghi chú thêm..."
                />
              </div>
              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>
              Hủy
            </Button>
            <Button
              onClick={handleDeposit}
              loading={loading}
              loadingLabel="Đang xử lý..."
              className="min-w-[10rem] bg-blue-600 text-white hover:bg-blue-700"
            >
              Xác Nhận Cọc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Undeposit dialog ──────────────────────────────────────────────── */}
      <AlertDialog open={openDialog === "undeposit"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
            <AlertDialogTitle>Hủy Cọc Tài Khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Tài khoản <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span> sẽ được chuyển về trạng thái{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">Đang bán</span> và xóa thông tin cọc.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <AlertDialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>
              Hủy
            </Button>
            <Button
              onClick={handleUndeposit}
              loading={loading}
              loadingLabel="Đang xử lý..."
              className="min-w-[8rem] bg-blue-600 text-white hover:bg-blue-700"
            >
              Xác Nhận Hủy Cọc
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Unmark sold dialog ─────────────────────────────────────────────── */}
      <AlertDialog open={openDialog === "unmark-sold"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
            <AlertDialogTitle>Gỡ Đánh Dấu Đã Bán</AlertDialogTitle>
            <AlertDialogDescription>
              Tài khoản <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span> sẽ được chuyển về trạng thái{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">Đang bán</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <AlertDialogFooter>
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
