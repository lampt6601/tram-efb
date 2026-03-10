"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Tag, Loader2, X } from "lucide-react";
import type { AccountStatus } from "@/types/database";
import { notifyAdminAction } from "@/app/actions/notify-admin";

interface SaleButtonProps {
  id: string;
  title: string;
  currentSellingPrice: number;
  currentOriginalPrice: number | null;
  status: AccountStatus;
}

export function SaleAccountButton({
  id,
  title,
  currentSellingPrice,
  currentOriginalPrice,
  status,
}: SaleButtonProps) {
  const [open, setOpen] = useState(false);

  // Use current selling price as the default "Original Price" if it's not already on sale
  const [originalPrice, setOriginalPrice] = useState(
    currentOriginalPrice
      ? currentOriginalPrice.toString()
      : currentSellingPrice.toString(),
  );

  // For the new "Sale Price", we just start it empty or slightly lower
  const [salePrice, setSalePrice] = useState(currentSellingPrice.toString());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  // If sold, we don't need a sale button
  if (status === "Sold") return null;

  const handleOpen = () => {
    // Reset values to current state whenever opening
    setOriginalPrice(
      currentOriginalPrice
        ? currentOriginalPrice.toString()
        : currentSellingPrice.toString(),
    );
    setSalePrice(currentSellingPrice.toString());
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    if (!loading) setOpen(false);
  };

  const handleConfirm = async () => {
    const parsedOriginal = parseFloat(originalPrice);
    const parsedSale = parseFloat(salePrice);

    if (isNaN(parsedSale) || parsedSale < 0) {
      setError("Vui lòng nhập giá Sale hợp lệ.");
      return;
    }

    // Only validate original price if it's provided (can be empty to remove sale)
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

      await notifyAdminAction("UPDATE_SALE", title);

      setOpen(false);
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
        .update({
          original_price: null,
        })
        .eq("id", id);

      if (err) throw err;

      await notifyAdminAction("UPDATE_SALE", title);

      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        title="Thiết lập Sale"
        className="rounded-lg p-1.5 sm:p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 relative"
      >
        <Tag className="h-4 w-4" />
        {currentOriginalPrice && currentOriginalPrice > currentSellingPrice && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50">
                <Tag className="h-5 w-5 text-rose-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Cài Đặt Khuyến Mãi (Sale)
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Thiết lập giá gốc và giá giảm để tạo hiệu ứng thẻ sale nổi bật.
              </p>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Giá Bị Gạch / Giá Gốc (VNĐ)
                </label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  min="0"
                  step="1"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500 disabled:opacity-60"
                  placeholder="Ví dụ: 1000000"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Giá Sale Bán Thực Tế (VNĐ)
                </label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  min="0"
                  step="1"
                  disabled={loading}
                  className="w-full rounded-xl border border-rose-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500 disabled:opacity-60 bg-rose-50/30"
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Đang xử lý..." : "Lưu Thay Đổi"}
                </button>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>

              {currentOriginalPrice &&
                currentOriginalPrice > currentSellingPrice && (
                  <button
                    onClick={handleRemoveSale}
                    disabled={loading}
                    className="mt-1 w-full rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50"
                  >
                    Hủy bỏ Sale cho tài khoản này
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
