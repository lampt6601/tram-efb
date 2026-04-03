"use client";

import { StatusBadge } from "@thc-efb/ui/badge";
import type { AccountWithEmail } from "@thc-efb/supabase/types";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@thc-efb/ui/responsive-dialog";
import { ApproveButton } from "@/app/dashboard/super/pending/ApproveButton";
import { AccountDetailContent } from "./AccountDetailContent";

interface AccountDetailDialogProps {
  account: AccountWithEmail;
  adminName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showApproveButton?: boolean;
}

export function AccountDetailDialog({
  account,
  adminName,
  open,
  onOpenChange,
  showApproveButton = false,
}: AccountDetailDialogProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        <ResponsiveDialogHeader className="px-5 pt-5 pb-3 text-left">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={account.status} />
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ID: {account.id.slice(0, 8)}…
            </span>
          </div>
          <ResponsiveDialogTitle className="text-base font-semibold leading-snug">
            {account.title}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="sr-only">
            Chi tiết tài khoản {account.title}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <AccountDetailContent account={account} adminName={adminName} />
        </div>

        {showApproveButton && !account.is_approved && account.status !== "Sold" && (
          <ResponsiveDialogFooter className="shrink-0 px-5 pb-5 pt-3">
            <ApproveButton
              accountId={account.id}
              accountTitle={account.title}
              sellingPrice={account.selling_price}
              onApproved={() => onOpenChange(false)}
              fullWidth
            />
          </ResponsiveDialogFooter>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
