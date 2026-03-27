import { Trophy, TrendingUp } from "lucide-react";

interface SellerRank {
  name: string;
  soldCount: number;
  revenue: number;
}

interface CTVLeaderboardProps {
  sellers: SellerRank[];
}

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

const medals = ["🥇", "🥈", "🥉"];

export function CTVLeaderboard({ sellers }: CTVLeaderboardProps) {
  if (sellers.length === 0) return null;

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/5">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-indigo-500" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Top CTV Tháng Này
        </h2>
      </div>
      <div className="space-y-2">
        {sellers.map((s, i) => (
          <div
            key={s.name}
            className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-white px-3.5 py-2.5 dark:border-indigo-500/10 dark:bg-slate-800"
          >
            <span className="w-6 text-center text-base">
              {i < 3 ? medals[i] : `${i + 1}.`}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                {s.name}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>{s.soldCount} acc</span>
                <span className="flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  {fmt(s.revenue)}đ
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
