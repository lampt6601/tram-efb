"use client";

import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setAdminCanViewAllAccounts } from "@/app/actions/super-admin-actions";

interface ViewAllAccountsToggleProps {
  adminId: string;
  adminEmail: string;
  enabled: boolean;
}

export function ViewAllAccountsToggle({ adminId, adminEmail, enabled }: ViewAllAccountsToggleProps) {
  const [active, setActive] = useState(enabled);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const next = !active;
    setLoading(true);
    try {
      await setAdminCanViewAllAccounts(adminId, next);
      setActive(next);
      toast.success(
        next
          ? `Đã cấp quyền xem tất cả acc cho ${adminEmail}`
          : `Đã thu hồi quyền xem tất cả acc của ${adminEmail}`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={active ? "Thu hồi quyền xem tất cả acc" : "Cấp quyền xem tất cả acc"}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        active
          ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
          : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
      }`}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
            <span>{active ? "Được xem" : "Bị ẩn"}</span>
          </>
        ) : (
          <>
            <Eye className={`h-3.5 w-3.5 shrink-0 ${active ? "text-indigo-500" : ""}`} />
            <span>{active ? "Được xem" : "Bị ẩn"}</span>
          </>
        )}
      </span>
    </button>
  );
}
