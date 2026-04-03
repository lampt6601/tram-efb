"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";
import { StatusBadge } from "@thc-efb/ui/badge";
import { ApproveButton } from "./ApproveButton";
import type { AccountWithEmail } from "@thc-efb/supabase/types";
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  DrawerOverlay,
  DrawerPortal,
} from "@thc-efb/ui/drawer";
import { Drawer as DrawerPrimitive } from "vaul";
import { AccountDetailContent } from "@/components/admin/AccountDetailContent";

interface PendingAccountDrawerProps {
  account: AccountWithEmail;
  adminEmail: string;
  showApproveButton?: boolean;
  controlledOpen?: boolean;
  onControlledClose?: () => void;
}

export function PendingAccountDrawer({
  account,
  adminEmail,
  showApproveButton = false,
  controlledOpen,
  onControlledClose,
}: PendingAccountDrawerProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;

  const onOpenChange = (value: boolean) => {
    if (isControlled) {
      if (!value) onControlledClose?.();
    } else {
      setInternalOpen(value);
    }
  };

  const onClose = () => onOpenChange(false);

  const canShowApproveButton =
    showApproveButton && !account.is_approved && account.status !== "Sold";

  return (
    <>
      {!isControlled && (
        <button
          onClick={() => setInternalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
        >
          <Eye className="h-3.5 w-3.5" />
          Chi tiết
        </button>
      )}

      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerPortal>
          <DrawerOverlay />
          <DrawerPrimitive.Content
            data-slot="drawer-content"
            className="fixed inset-y-0 right-0 z-[200] flex h-full w-full max-w-lg flex-col rounded-l-2xl bg-white shadow-2xl outline-none dark:bg-slate-800"
          >
          {/* Header */}
          <DrawerHeader className="justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DrawerTitle className="truncate">
                  {account.title}
                </DrawerTitle>
                <StatusBadge status={account.status} />
              </div>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                ID: {account.id.slice(0, 8)}…
              </p>
            </div>
            <DrawerClose className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300">
              <X className="h-5 w-5" />
            </DrawerClose>
          </DrawerHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            <AccountDetailContent account={account} adminName={adminEmail} />
          </div>

          {/* Footer with approve button */}
          {canShowApproveButton && (
            <DrawerFooter>
              <ApproveButton
                accountId={account.id}
                accountTitle={account.title}
                sellingPrice={account.selling_price}
                onApproved={onClose}
                fullWidth
              />
            </DrawerFooter>
          )}
          </DrawerPrimitive.Content>
        </DrawerPortal>
      </Drawer>
    </>
  );
}
