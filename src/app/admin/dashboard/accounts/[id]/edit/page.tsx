"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { AccountForm } from "@/components/admin/AccountForm";
import { Loader2 } from "lucide-react";
import type { Account } from "@/types/database";

export default function EditAccountPage() {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("accounts")
        .select("id, title, description, selling_price, purchase_price, original_price, images, primary_image_url, status, total_gp, total_coins_android, total_coins_ios, team_strength, is_priority, is_clone, is_approved, server_region, monthly_log_quota, email_id, user_id, created_at, updated_at")
        .eq("id", id)
        .single();
      setAccount(data as Account | null);
      setLoading(false);
    };
    fetch();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="py-20 text-center text-slate-400 dark:text-slate-500">
        Không tìm thấy tài khoản.
      </div>
    );
  }

  return <AccountForm account={account} />;
}
