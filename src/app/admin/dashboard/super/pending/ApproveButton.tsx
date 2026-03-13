"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
import { approveAccount } from "@/app/actions/super-admin-actions";

interface ApproveButtonProps {
  accountId: string;
  accountTitle: string;
  onApproved?: () => void;
  fullWidth?: boolean;
}

export function ApproveButton({
  accountId,
  accountTitle,
  onApproved,
  fullWidth = false,
}: ApproveButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveAccount(accountId);
      toast.success(`Đã duyệt tài khoản "${accountTitle}"`);
      onApproved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${fullWidth ? "w-full py-2.5 text-sm" : ""}`}
    >
      {loading ? (
        <Loader2 className={`animate-spin ${fullWidth ? "h-4 w-4" : "h-3.5 w-3.5"}`} />
      ) : (
        <CheckCircle className={fullWidth ? "h-4 w-4" : "h-3.5 w-3.5"} />
      )}
      {loading ? "Đang duyệt..." : "Duyệt Tài Khoản"}
    </button>
  );
}
