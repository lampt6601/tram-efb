"use client";

import { useState } from "react";
import { Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setAdminDisabled } from "@/app/actions/super-admin-actions";

interface DisableAdminToggleProps {
  adminId: string;
  adminEmail: string;
  disabled: boolean;
}

export function DisableAdminToggle({ adminId, adminEmail, disabled }: DisableAdminToggleProps) {
  const [isDisabled, setIsDisabled] = useState(disabled);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const next = !isDisabled;
    setLoading(true);
    try {
      await setAdminDisabled(adminId, next);
      setIsDisabled(next);
      toast.success(
        next
          ? `Đã vô hiệu hóa ${adminEmail}`
          : `Đã kích hoạt lại ${adminEmail}`
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
      title={isDisabled ? "Kích hoạt lại admin" : "Vô hiệu hóa admin"}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        isDisabled
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
      }`}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
            <span>{isDisabled ? "Đã khóa" : "Hoạt động"}</span>
          </>
        ) : (
          <>
            <Ban className={`h-3.5 w-3.5 shrink-0 ${isDisabled ? "text-red-500" : ""}`} />
            <span>{isDisabled ? "Đã khóa" : "Hoạt động"}</span>
          </>
        )}
      </span>
    </button>
  );
}
