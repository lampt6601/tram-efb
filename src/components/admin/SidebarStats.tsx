"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Package, CheckCircle } from "lucide-react";

export function SidebarStats() {
  const [available, setAvailable] = useState<number | null>(null);
  const [soldThisWeek, setSoldThisWeek] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    (async () => {
      const { count: avail } = await supabase
        .from("accounts")
        .select("*", { count: "exact", head: true })
        .eq("status", "Available");
      setAvailable(avail ?? 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: sold } = await supabase
        .from("accounts")
        .select("*", { count: "exact", head: true })
        .eq("status", "Sold")
        .gte("updated_at", weekAgo.toISOString());
      setSoldThisWeek(sold ?? 0);
    })();
  }, []);

  if (available === null) return null;

  return (
    <div className="grid grid-cols-2 gap-2 px-3 pb-2">
      <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 dark:bg-emerald-500/10">
        <Package className="h-3.5 w-3.5 text-emerald-500" />
        <div>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {available}
          </p>
          <p className="text-[9px] text-emerald-600/70 dark:text-emerald-400/60">
            Đang bán
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 dark:bg-indigo-500/10">
        <CheckCircle className="h-3.5 w-3.5 text-indigo-500" />
        <div>
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
            {soldThisWeek}
          </p>
          <p className="text-[9px] text-indigo-600/70 dark:text-indigo-400/60">
            Bán tuần này
          </p>
        </div>
      </div>
    </div>
  );
}
