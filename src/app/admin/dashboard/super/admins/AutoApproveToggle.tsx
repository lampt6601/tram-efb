"use client";

import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setAdminAutoApprove } from "@/app/actions/super-admin-actions";

interface AutoApproveToggleProps {
  adminId: string;
  adminEmail: string;
  enabled: boolean;
}

export function AutoApproveToggle({ adminId, adminEmail, enabled }: AutoApproveToggleProps) {
  const [active, setActive] = useState(enabled);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const next = !active;
    setLoading(true);
    try {
      await setAdminAutoApprove(adminId, next);
      setActive(next);
      toast.success(
        next
          ? `Đã bật auto duyệt cho ${adminEmail}`
          : `Đã tắt auto duyệt cho ${adminEmail}`
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
      title={active ? "Tắt auto duyệt" : "Bật auto duyệt"}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
      }`}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
            <span>{active ? "Auto duyệt" : "Thủ công"}</span>
          </>
        ) : (
          <>
            <Zap className={`h-3.5 w-3.5 shrink-0 ${active ? "fill-emerald-500 text-emerald-500" : ""}`} />
            <span>{active ? "Auto duyệt" : "Thủ công"}</span>
          </>
        )}
      </span>
    </button>
  );
}
