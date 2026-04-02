"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { unapproveAccount } from "@/app/actions/super-admin-actions";

interface UnapproveButtonProps {
  accountId: string;
  accountTitle: string;
}

export function UnapproveButton({ accountId, accountTitle }: UnapproveButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="hidden text-xs text-amber-700 sm:inline dark:text-amber-400">Xác nhận?</span>
        <button
          onClick={async () => {
            setConfirming(false);
            setLoading(true);
            try {
              await unapproveAccount(accountId);
              toast.success(`Đã chuyển "${accountTitle}" về chờ duyệt`);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
            } finally {
              setLoading(false);
            }
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
        >
          <AlertTriangle className="h-3 w-3" />
          Xác nhận
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          Huỷ
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 hover:border-amber-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span>Chờ duyệt</span>
          </>
        )}
      </span>
    </button>
  );
}
