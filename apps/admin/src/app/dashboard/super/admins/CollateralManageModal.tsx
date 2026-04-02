"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  RotateCcw,
  CircleDollarSign,
  History,
} from "lucide-react";
import {
  updateSellerCollateral,
  getSellerCollateralHistory,
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
import { toast } from "sonner";
import { formatCurrency } from "@thc-efb/shared/constants";
import type { SellerCollateralHistory } from "@thc-efb/supabase/types";

interface CollateralManageModalProps {
  open: boolean;
  onClose: () => void;
  adminId: string;
  adminEmail: string;
  currentAmount: number;
}

const CHANGE_TYPES = [
  { value: "initial" as const, label: "Ký quỹ lần đầu", icon: CircleDollarSign },
  { value: "increase" as const, label: "Nạp thêm", icon: ArrowUpCircle },
  { value: "decrease" as const, label: "Rút bớt", icon: ArrowDownCircle },
  { value: "refund" as const, label: "Hoàn trả", icon: RotateCcw },
];

function formatDate(d: string) {
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function changeTypeLabel(type: string) {
  const found = CHANGE_TYPES.find((t) => t.value === type);
  return found?.label ?? type;
}

function changeTypeColor(type: string) {
  switch (type) {
    case "increase":
    case "initial":
      return "text-emerald-600 dark:text-emerald-400";
    case "decrease":
    case "refund":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-slate-600 dark:text-slate-300";
  }
}

export function CollateralManageModal({
  open,
  onClose,
  adminId,
  adminEmail,
  currentAmount,
}: CollateralManageModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [changeType, setChangeType] = useState<"increase" | "decrease" | "refund" | "initial">(
    currentAmount === 0 ? "initial" : "increase",
  );
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState<SellerCollateralHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const stableOnClose = useCallback(() => {
    if (!loading) onClose();
  }, [loading, onClose]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setAmount("");
    setNotes("");
    setChangeType(currentAmount === 0 ? "initial" : "increase");

    setLoadingHistory(true);
    getSellerCollateralHistory(adminId)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [open, adminId, currentAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await updateSellerCollateral(adminId, changeType, parsedAmount, notes || undefined);
      toast.success("Đã cập nhật ký quỹ thành công");
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && !v && stableOnClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md p-0 gap-0 flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="shrink-0 p-5 pb-0">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">Quản Lý Ký Quỹ</DialogTitle>
                <DialogDescription className="max-w-[220px] truncate text-xs">{adminEmail}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Current amount */}
          <div className="mb-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Mức ký quỹ hiện tại
            </p>
            <p className="text-xl font-bold text-amber-800 dark:text-amber-300">
              {currentAmount > 0 ? formatCurrency(currentAmount) : "Chưa ký quỹ"}
            </p>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5">
          {/* Form */}
          <form id="collateral-form" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Loại thay đổi</Label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {CHANGE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setChangeType(type.value)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        changeType === type.value
                          ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                      }`}
                    >
                      <type.icon className="h-3.5 w-3.5" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-200">Số tiền (VNĐ)</Label>
                <Input
                  type="number"
                  min="1000"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ví dụ: 500000"
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                  autoFocus
                />
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-200">
                  Ghi chú <span className="text-slate-400">(tùy chọn)</span>
                </Label>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ký quỹ qua chuyển khoản..."
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                />
              </div>
            </div>
            {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
          </form>

          {/* History */}
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
            <div className="mb-2 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Lịch sử ký quỹ
              </span>
            </div>
            {loadingHistory ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            ) : history.length === 0 ? (
              <p className="py-3 text-center text-xs text-slate-400">Chưa có lịch sử</p>
            ) : (
              <div className="mb-4 space-y-1.5">
                {history.slice(0, 10).map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700/50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${changeTypeColor(h.change_type)}`}>
                          {h.change_type === "increase" || h.change_type === "initial" ? "+" : "−"}
                          {formatCurrency(h.amount)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {changeTypeLabel(h.change_type)}
                        </span>
                      </div>
                      {h.notes && (
                        <p className="mt-0.5 truncate text-[10px] text-slate-400">{h.notes}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-slate-400">{formatDate(h.created_at)}</p>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        → {formatCurrency(h.new_total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={stableOnClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="collateral-form"
            loading={loading}
            loadingLabel="Đang lưu..."
            className="min-w-[6rem] bg-amber-600 text-white hover:bg-amber-700"
          >
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
