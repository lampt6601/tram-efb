"use client";

import { useState } from "react";
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
} from "lucide-react";
import type { AccountStatus } from "@/types/database";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AccountActionsDropdownProps {
  id: string;
  title: string;
  purchasePrice: number;
  currentSellingPrice: number;
  currentOriginalPrice: number | null;
  status: AccountStatus;
}

type OpenDialog = "sell" | "sale" | "delete" | null;

export function AccountActionsDropdown({
  id,
  title,
  purchasePrice,
  currentSellingPrice,
  currentOriginalPrice,
  status,
}: AccountActionsDropdownProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Copy link state
  const [copied, setCopied] = useState(false);

  // Sell dialog state
  const [sellPrice, setSellPrice] = useState(currentSellingPrice.toString());

  // Sale dialog state
  const [saleOriginalPrice, setSaleOriginalPrice] = useState(
    currentOriginalPrice
      ? currentOriginalPrice.toString()
      : currentSellingPrice.toString(),
  );
  const [salePrice, setSalePrice] = useState(currentSellingPrice.toString());

  const openDialogWithReset = (dialog: OpenDialog) => {
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `https://thc-efb.vercel.app/accounts/${id}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // --- Sell ---
  const handleSell = async () => {
    const parsedPrice = parseFloat(sellPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Vui lòng nhập giá bán hợp lệ.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase
        .from("accounts")
        .update({ status: "Sold", selling_price: parsedPrice, email_id: null })
        .eq("id", id);
      if (err) throw err;
      try {
        await notifyAdminAction("SELL", title, { purchasePrice, sellingPrice: parsedPrice });
      } catch { /* ignore notify errors */ }
      setOpenDialog(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // --- Sale ---
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
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase
        .from("accounts")
        .update({
          selling_price: parsedSale,
          original_price: saleOriginalPrice !== "" ? parsedOriginal : null,
        })
        .eq("id", id);
      if (err) throw err;
      try {
        await notifyAdminAction("UPDATE_SALE", title, {
          purchasePrice,
          sellingPrice: parsedSale,
          originalPrice: saleOriginalPrice !== "" ? parsedOriginal : null,
        });
      } catch { /* ignore */ }
      setOpenDialog(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
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
      try { await notifyAdminAction("UPDATE_SALE", title); } catch { /* ignore */ }
      setOpenDialog(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // --- Delete ---
  const handleDelete = async () => {
    setLoading(true);
    try {
      await supabase.from("accounts").delete().eq("id", id);
      try { await notifyAdminAction("DELETE", title); } catch { /* ignore */ }
      setOpenDialog(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const isSold = status === "Sold";
  const isOnSale = !!(currentOriginalPrice && currentOriginalPrice > currentSellingPrice);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 border border-slate-200">
              Tác vụ
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          {/* Edit */}
          <DropdownMenuItem
            render={
              <Link href={`/admin/dashboard/accounts/${id}/edit`} className="flex items-center gap-2" />
            }
          >
            <Pencil className="h-4 w-4 text-slate-400" />
            Chỉnh sửa
          </DropdownMenuItem>

          {/* Copy link */}
          <DropdownMenuItem onSelect={handleCopyLink} className="gap-2">
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <LinkIcon className="h-4 w-4 text-slate-400" />
            )}
            {copied ? "Đã copy!" : "Copy link"}
          </DropdownMenuItem>

          {!isSold && (
            <>
              <DropdownMenuSeparator />

              {/* Sale pricing */}
              <DropdownMenuItem
                onSelect={() => openDialogWithReset("sale")}
                className="gap-2"
              >
                <Tag className="h-4 w-4 text-rose-400" />
                {isOnSale ? "Chỉnh giá sale" : "Thiết lập sale"}
              </DropdownMenuItem>

              {/* Mark as sold */}
              <DropdownMenuItem
                onSelect={() => openDialogWithReset("sell")}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4 text-green-500" />
                Đánh dấu đã bán
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />

          {/* Delete */}
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => openDialogWithReset("delete")}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Xóa tài khoản
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sell dialog */}
      <Dialog open={openDialog === "sell"} onOpenChange={(v) => !loading && setOpenDialog(v ? "sell" : null)}>
        <DialogContent>
          <DialogHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <DialogTitle>Xác Nhận Bán Tài Khoản</DialogTitle>
            <DialogDescription>
              Giá dự kiến sẽ được cập nhật thành giá bán thực tế. Email liên
              kết sẽ bị gỡ tự động.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="mb-1.5 text-slate-700">Giá Bán Thực Tế (VNĐ)</Label>
            <Input
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              min="0"
              step="1"
              disabled={loading}
              className="mt-1.5 rounded-xl border-slate-300 focus-visible:border-green-500 focus-visible:ring-green-500/30"
              autoFocus
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)} disabled={loading}>Hủy</Button>
            <Button onClick={handleSell} disabled={loading} className="bg-green-600 text-white hover:bg-green-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Đang xử lý..." : "Xác Nhận Bán"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sale dialog */}
      <Dialog open={openDialog === "sale"} onOpenChange={(v) => !loading && setOpenDialog(v ? "sale" : null)}>
        <DialogContent>
          <DialogHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50">
              <Tag className="h-5 w-5 text-rose-600" />
            </div>
            <DialogTitle>Cài Đặt Khuyến Mãi (Sale)</DialogTitle>
            <DialogDescription>
              Thiết lập giá gốc và giá giảm để tạo hiệu ứng thẻ sale nổi bật.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 text-slate-700">Giá Bị Gạch / Giá Gốc (VNĐ)</Label>
              <Input
                type="number"
                value={saleOriginalPrice}
                onChange={(e) => setSaleOriginalPrice(e.target.value)}
                min="0"
                step="1"
                disabled={loading}
                className="mt-1.5 rounded-xl border-slate-300 focus-visible:border-rose-500 focus-visible:ring-rose-500/30"
                placeholder="Ví dụ: 1000000"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-slate-700">Giá Sale Bán Thực Tế (VNĐ)</Label>
              <Input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                min="0"
                step="1"
                disabled={loading}
                className="mt-1.5 rounded-xl border-rose-300 bg-rose-50/30 focus-visible:border-rose-500 focus-visible:ring-rose-500/30"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
          <DialogFooter className="flex-col gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setOpenDialog(null)} disabled={loading}>Hủy</Button>
              <Button onClick={handleSaleConfirm} disabled={loading} className="flex-1 bg-rose-600 text-white hover:bg-rose-700 sm:flex-none">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Đang xử lý..." : "Lưu Thay Đổi"}
              </Button>
            </div>
            {isOnSale && (
              <Button variant="ghost" onClick={handleRemoveSale} disabled={loading} className="w-full text-slate-600 hover:text-slate-800 hover:bg-slate-100">
                Hủy bỏ Sale cho tài khoản này
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={openDialog === "delete"} onOpenChange={(v) => !loading && setOpenDialog(v ? "delete" : null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Xóa tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản{" "}
              <span className="font-semibold text-slate-900">"{title}"</span>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)} disabled={loading}>Hủy</Button>
            <Button onClick={handleDelete} disabled={loading} className="bg-red-600 text-white hover:bg-red-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
