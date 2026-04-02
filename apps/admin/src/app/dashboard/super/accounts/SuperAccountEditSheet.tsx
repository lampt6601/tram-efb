"use client";

import { useEffect, useState } from "react";
import { SuperAdminAccountForm } from "./[id]/edit/SuperAdminAccountForm";
import { getSuperAccountForEdit } from "@/app/actions/super-admin-actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@thc-efb/ui/sheet";
import { Skeleton } from "@thc-efb/ui/skeleton";
import { Pencil } from "lucide-react";
import type { Account, Email } from "@thc-efb/supabase/types";

interface SuperAccountEditSheetProps {
  accountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuperAccountEditSheet({ accountId, open, onOpenChange }: SuperAccountEditSheetProps) {
  const [account, setAccount] = useState<Account | null>(null);
  const [availableEmails, setAvailableEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) {
      setAccount(null);
      setLoading(true);
      return;
    }

    async function fetchData() {
      setLoading(true);
      const result = await getSuperAccountForEdit(accountId);
      if (result) {
        setAccount(result.account as Account);
        setAvailableEmails(result.availableEmails as Email[]);
      }
      setLoading(false);
    }

    fetchData();
  }, [accountId, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
              <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <SheetTitle>Chỉnh Sửa Tài Khoản</SheetTitle>
              <SheetDescription>
                {account?.title ? `${account.title.slice(0, 50)}${account.title.length > 50 ? "..." : ""}` : "Đang tải..."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <SheetBody>
          {loading ? (
            <div className="space-y-4 p-5">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : account ? (
            <SuperAdminAccountForm
              account={account}
              availableEmails={availableEmails}
              embedded
              onSuccess={() => onOpenChange(false)}
            />
          ) : (
            <div className="flex items-center justify-center p-10 text-sm text-slate-500">
              Không tìm thấy tài khoản
            </div>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
