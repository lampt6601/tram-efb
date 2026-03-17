"use client";

import { Trophy, Gift } from "lucide-react";

interface EventResult {
  prize_type: string;
  winning_number: number;
  zalo_name: string;
  facebook_name: string;
}

interface WinnerAnnouncementProps {
  results: EventResult[];
}

export function WinnerAnnouncement({ results }: WinnerAnnouncementProps) {
  const grand = results.find((r) => r.prize_type === "grand");
  const consolation = results.find((r) => r.prize_type === "consolation");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-3 text-5xl">🎉</div>
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          KẾT QUẢ TRÚNG GIẢI
        </h2>
        <p className="mt-2 text-sm text-white/50">
          Chúc mừng các anh em đã trúng giải! 🎊
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Grand Prize */}
        {grand && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 p-6 backdrop-blur-sm">
            <div className="absolute -right-4 -top-4 text-7xl opacity-10">🏆</div>
            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    🥇 Giải May Mắn
                  </span>
                  <p className="text-xs text-amber-300/60">Acc game trị giá 5xx k</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Số trúng</span>
                  <span className="text-2xl font-black text-amber-300">#{grand.winning_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Zalo</span>
                  <span className="text-sm font-bold text-white">{grand.zalo_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Facebook</span>
                  <span className="text-sm font-bold text-white">{grand.facebook_name}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Consolation Prize */}
        {consolation && (
          <div className="relative overflow-hidden rounded-2xl border border-slate-400/30 bg-gradient-to-br from-slate-400/20 via-zinc-400/10 to-slate-500/20 p-6 backdrop-blur-sm">
            <div className="absolute -right-4 -top-4 text-7xl opacity-10">🎁</div>
            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-400/20">
                  <Gift className="h-5 w-5 text-slate-300" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    🥈 Giải Hơi May Mắn
                  </span>
                  <p className="text-xs text-slate-300/60">Acc game trị giá xx k</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Số trúng</span>
                  <span className="text-2xl font-black text-slate-200">#{consolation.winning_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Zalo</span>
                  <span className="text-sm font-bold text-white">{consolation.zalo_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Facebook</span>
                  <span className="text-sm font-bold text-white">{consolation.facebook_name}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-center">
        <p className="text-xs text-indigo-200">
          Admin sẽ liên hệ người trúng giải để xác minh và trao thưởng. 
          Anh em hãy chuẩn bị bằng chứng (ảnh chụp kết bạn FB, lịch sử mời bạn vào Zalo group...) nhé! 💪
        </p>
      </div>
    </div>
  );
}
