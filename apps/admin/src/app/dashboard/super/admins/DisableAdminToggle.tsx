"use client";

import { Ban } from "lucide-react";
import { setAdminDisabled } from "@/app/actions/super-admin-actions";
import { AdminToggleButton } from "@/components/admin/AdminToggleButton";

interface DisableAdminToggleProps {
  adminId: string;
  adminEmail: string;
  disabled: boolean;
}

export function DisableAdminToggle({ adminId, adminEmail, disabled }: DisableAdminToggleProps) {
  return (
    <AdminToggleButton
      active={disabled}
      icon={Ban}
      activeLabel="Đã khóa"
      inactiveLabel="Hoạt động"
      activeClassName="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
      inactiveClassName="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
      activeIconClassName="text-red-500"
      activeTitle="Kích hoạt lại admin"
      inactiveTitle="Vô hiệu hóa admin"
      onToggle={(next) => setAdminDisabled(adminId, next)}
      successMessage={(next) =>
        next
          ? `Đã vô hiệu hóa ${adminEmail}`
          : `Đã kích hoạt lại ${adminEmail}`
      }
    />
  );
}
