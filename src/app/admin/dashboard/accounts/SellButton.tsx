"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ShoppingCart, Loader2 } from "lucide-react";
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

interface SellButtonProps {
  id: string;
  title: string;
  purchasePrice: number;
  currentSellingPrice: number;
  status: AccountStatus;
}

export function SellAccountButton({
  id,
  title,
  purchasePrice,
  currentSellingPrice,
  status,
}: SellButtonProps) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(currentSellingPrice.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  if (status === "Sold") return null;

  const handleOpenChange = (val: boolean) => {
    if (!loading) {
      setOpen(val);
      if (val) {
        setPrice(currentSellingPrice.toString());
        setError("");
      }
    }
  };

  const handleConfirm = async () => {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Vui lòng nhập giá bán hợp lệ.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: err } = await supabase
        .from("accounts")
        .update({
          status: "Sold",
          selling_price: parsedPrice,
          email_id: null,
        })
        .eq("id", id);

      if (err) throw err;

      try {
        await notifyAdminAction("SELL", title, {
          purchasePrice,
          sellingPrice: parsedPrice,
        });
      } catch (notifyErr) {
        console.error("Notification failed:", notifyErr);
      }

      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            title="Bán tài khoản"
            className="rounded-lg p-1.5 sm:p-2 text-slate-400 transition-colors hover:bg-green-50 hover:text-green-600"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
            <ShoppingCart className="h-5 w-5 text-green-600" />
          </div>
          <DialogTitle>Xác Nhận Bán Tài Khoản</DialogTitle>
          <DialogDescription>
            Giá dự kiến sẽ được cập nhật thành giá bán thực tế. Email liên kết
            sẽ bị gỡ tự động.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-1">
          <Label className="mb-1.5 text-slate-700">Giá Bán Thực Tế (VNĐ)</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="1"
            disabled={loading}
            className="mt-1.5 rounded-xl border-slate-300 focus-visible:border-green-500 focus-visible:ring-green-500/30"
            autoFocus
          />
          {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>

        <DialogFooter>
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
            aria-busy={loading}
            className="min-w-[10rem] bg-green-600 text-white hover:bg-green-700"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {loading && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
              )}
              <span>{loading ? "Đang xử lý..." : "Xác Nhận Bán"}</span>
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
