"use client";

import { Zap } from "lucide-react";
import { setAdminAutoApprove } from "@/app/actions/super-admin-actions";
import { AdminToggleButton } from "@/components/admin/AdminToggleButton";

interface AutoApproveToggleProps {
  adminId: string;
  adminEmail: string;
  enabled: boolean;
}

export function AutoApproveToggle({ adminId, adminEmail, enabled }: AutoApproveToggleProps) {
  return (
    <AdminToggleButton
      active={enabled}
      icon={Zap}
      activeLabel="Auto duyệt"
      inactiveLabel="Thủ công"
      activeClassName="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
      inactiveClassName="border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
      activeIconClassName="fill-emerald-500 text-emerald-500"
      activeTitle="Tắt auto duyệt"
      inactiveTitle="Bật auto duyệt"
      onToggle={(next) => setAdminAutoApprove(adminId, next)}
      successMessage={(next) =>
        next
          ? `Đã bật auto duyệt cho ${adminEmail}`
          : `Đã tắt auto duyệt cho ${adminEmail}`
      }
    />
  );
}
