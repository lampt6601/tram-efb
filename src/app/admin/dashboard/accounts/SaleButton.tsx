"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Tag, Loader2 } from "lucide-react";
import type { AccountStatus } from "@/types/database";
import { notifyAdminAction } from "@/app/actions/notify-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SaleButtonProps {
  id: string;
  title: string;
  purchasePrice: number;
  currentSellingPrice: number;
  currentOriginalPrice: number | null;
  status: AccountStatus;
}

export function SaleAccountButton({
  id,
  title,
  purchasePrice,
  currentSellingPrice,
  currentOriginalPrice,
  status,
}: SaleButtonProps) {
  const [open, setOpen] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(
    currentOriginalPrice
      ? currentOriginalPrice.toString()
      : currentSellingPrice.toString(),
  );
  const [salePrice, setSalePrice] = useState(currentSellingPrice.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  if (status === "Sold") return null;

  const handleOpenChange = (val: boolean) => {
    if (!loading) {
      setOpen(val);
      if (val) {
        setOriginalPrice(
          currentOriginalPrice
            ? currentOriginalPrice.toString()
            : currentSellingPrice.toString(),
        );
        setSalePrice(currentSellingPrice.toString());
        setError("");
      }
    }
  };

  const handleConfirm = async () => {
    const parsedOriginal = parseFloat(originalPrice);
    const parsedSale = parseFloat(salePrice);

    if (isNaN(parsedSale) || parsedSale < 0) {
      setError("Vui lòng nhập giá Sale hợp lệ.");
      return;
    }

    if (
      originalPrice !== "" &&
      (isNaN(parsedOriginal) || parsedOriginal <= parsedSale)
    ) {
      setError("Giá gạch (Giá gốc) phải lớn hơn Giá Sale.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: err } = await supabase
        .from("accounts")
        .update({
          selling_price: parsedSale,
          original_price: originalPrice !== "" ? parsedOriginal : null,
        })
        .eq("id", id);

      if (err) throw err;

      try {
        await notifyAdminAction("UPDATE_SALE", title, {
          purchasePrice,
          sellingPrice: parsedSale,
          originalPrice: originalPrice !== "" ? parsedOriginal : null,
        });
      } catch (notifyErr) {
        console.error("Notification failed:", notifyErr);
      }

      setOpen(false);
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
        await notifyAdminAction("UPDATE_SALE", title);
      } catch (notifyErr) {
        console.error("Notification failed:", notifyErr);
      }

      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            title="Thiết lập Sale"
            className="rounded-lg p-1.5 sm:p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 relative"
          >
            <Tag className="h-4 w-4" />
            {currentOriginalPrice && currentOriginalPrice > currentSellingPrice && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
          </button>
        }
      />
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
            <Label className="mb-1.5 text-slate-700">
              Giá Bị Gạch / Giá Gốc (VNĐ)
            </Label>
            <Input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              min="0"
              step="1"
              disabled={loading}
              className="mt-1.5 rounded-xl border-slate-300 focus-visible:border-rose-500 focus-visible:ring-rose-500/30"
              placeholder="Ví dụ: 1000000"
            />
          </div>
          <div>
            <Label className="mb-1.5 text-slate-700">
              Giá Sale Bán Thực Tế (VNĐ)
            </Label>
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
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-rose-600 text-white hover:bg-rose-700 sm:flex-none"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Đang xử lý..." : "Lưu Thay Đổi"}
            </Button>
          </div>
          {currentOriginalPrice && currentOriginalPrice > currentSellingPrice && (
            <Button
              variant="ghost"
              onClick={handleRemoveSale}
              disabled={loading}
              className="w-full text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              Hủy bỏ Sale cho tài khoản này
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
