"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

interface AdminToggleButtonProps {
  active: boolean;
  icon: LucideIcon;
  activeLabel: string;
  inactiveLabel: string;
  activeClassName: string;
  inactiveClassName: string;
  activeIconClassName?: string;
  activeTitle: string;
  inactiveTitle: string;
  onToggle: (next: boolean) => Promise<void>;
  successMessage: (next: boolean) => string;
}

export function AdminToggleButton({
  active: initialActive,
  icon: Icon,
  activeLabel,
  inactiveLabel,
  activeClassName,
  inactiveClassName,
  activeIconClassName,
  activeTitle,
  inactiveTitle,
  onToggle,
  successMessage,
}: AdminToggleButtonProps) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const next = !active;
    setLoading(true);
    try {
      await onToggle(next);
      setActive(next);
      toast.success(successMessage(next));
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
      title={active ? activeTitle : inactiveTitle}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        active ? activeClassName : inactiveClassName
      }`}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
            <span>{active ? activeLabel : inactiveLabel}</span>
          </>
        ) : (
          <>
            <Icon className={`h-3.5 w-3.5 shrink-0 ${active && activeIconClassName ? activeIconClassName : ""}`} />
            <span>{active ? activeLabel : inactiveLabel}</span>
          </>
        )}
      </span>
    </button>
  );
}
