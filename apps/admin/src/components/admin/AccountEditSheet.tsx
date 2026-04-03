"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@thc-efb/supabase/browser";
import { AccountForm } from "./AccountForm";
import {
  ResponsiveSheet,
  ResponsiveSheetContent,
  ResponsiveSheetHeader,
  ResponsiveSheetTitle,
  ResponsiveSheetDescription,
  ResponsiveSheetBody,
} from "@thc-efb/ui/responsive-sheet";
import { Skeleton } from "@thc-efb/ui/skeleton";
import { Pencil } from "lucide-react";
import type { Account, Email } from "@thc-efb/supabase/types";

interface AccountEditSheetProps {
  accountId: string;
  /** Pre-loaded account from the table — renders form instantly while fetching emails */
  initialAccount?: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountEditSheet({ accountId, initialAccount, open, onOpenChange }: AccountEditSheetProps) {
  const [account, setAccount] = useState<Account | null>(initialAccount ?? null);
  const [availableEmails, setAvailableEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(!initialAccount);

  useEffect(() => {
    if (!open) {
      setAccount(initialAccount ?? null);
      setAvailableEmails([]);
      setLoading(!initialAccount);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    async function fetchData() {
      if (!initialAccount) setLoading(true);

      const [{ data: acc }, { data: allEmails }, { data: linkedAccounts }] =
        await Promise.all([
          supabase
            .from("accounts")
            .select(
              "id, title, description, selling_price, purchase_price, original_price, images, primary_image_url, status, total_gp, total_coins_android, total_coins_ios, team_strength, is_priority, is_clone, is_approved, server_region, monthly_log_quota, email_id, user_id, created_at, updated_at, deposit_customer_name, deposit_customer_contact, deposit_amount, deposit_hold_until, deposit_notes"
            )
            .eq("id", accountId)
            .single(),
          supabase.from("emails").select("*").order("email_address"),
          supabase
            .from("accounts")
            .select("email_id")
            .not("email_id", "is", null)
            .neq("id", accountId),
        ]);

      const finalAccount = (acc as Account) ?? initialAccount;

      if (finalAccount) {
        setAccount(finalAccount);

        const linkedIds = new Set(
          (linkedAccounts ?? []).map((a: { email_id: string }) => a.email_id)
        );
        const available = (allEmails ?? []).filter(
          (e: Email) => !linkedIds.has(e.id)
        );
        if (finalAccount.email_id) {
          const current = (allEmails ?? []).find(
            (e: Email) => e.id === finalAccount.email_id
          );
          if (current && !available.find((e: Email) => e.id === current.id)) {
            available.unshift(current);
          }
        }
        setAvailableEmails(available);
      }
      setLoading(false);
    }

    fetchData();
  }, [accountId, open]);

  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange}>
      <ResponsiveSheetContent side="right" className="w-full sm:max-w-xl">
        <ResponsiveSheetHeader>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
              <Pencil className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <ResponsiveSheetTitle>Chỉnh Sửa Tài Khoản</ResponsiveSheetTitle>
              <ResponsiveSheetDescription>
                {account?.title ? `${account.title.slice(0, 50)}${account.title.length > 50 ? "..." : ""}` : "Đang tải..."}
              </ResponsiveSheetDescription>
            </div>
          </div>
        </ResponsiveSheetHeader>
        <ResponsiveSheetBody>
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
            <AccountForm
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
        </ResponsiveSheetBody>
      </ResponsiveSheetContent>
    </ResponsiveSheet>
  );
}
