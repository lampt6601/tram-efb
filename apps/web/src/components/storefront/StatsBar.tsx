import { createSupabaseAnonClient } from '@thc-efb/supabase/anon';
import { getSellerCount } from "@/lib/cached-users";
import { ShieldCheck, Users } from "lucide-react";

export async function StatsBar() {
  const supabase = createSupabaseAnonClient();

  const [{ count: soldCount }, sellerCount] =
    await Promise.all([
      supabase
        .from("public_sold_accounts")
        .select("*", { count: "exact", head: true }),
      getSellerCount(),
    ]);

  const stats = [
    {
      icon: ShieldCheck,
      value: `${soldCount ?? 0}+`,
      label: "Giao dịch thành công",
      color: "text-emerald-400",
    },
    {
      icon: Users,
      value: `${sellerCount > 0 ? sellerCount : 0}+`,
      label: "Người bán",
      color: "text-indigo-400",
    },
  ];

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-5 sm:mt-8 sm:gap-10 lg:justify-start">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-2.5">
          <stat.icon className={`h-5 w-5 ${stat.color}`} />
          <div>
            <p className="text-lg font-bold text-white sm:text-xl">
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-400">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
