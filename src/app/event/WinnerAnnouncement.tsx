"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";

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

      {grand && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 p-6 backdrop-blur-sm">
          <div className="absolute -right-4 -top-4 text-7xl opacity-10">🏆</div>
          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    🥇 Giải May Mắn (1 giải duy nhất)
                  </span>
                  <p className="text-xs text-amber-300/60">Acc game trị giá 1xx k VND</p>
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                Số trúng: <span className="font-black text-amber-300">#{grand.winning_number}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Zalo / Facebook</span>
                  <span className="text-sm font-bold text-white">{grand.zalo_name}</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/50">Giải thưởng</p>
                  <p className="mt-1 text-sm font-semibold text-white/90">
                    1 Acc game (1xx k VND)
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <Image
                  src="/event-prize.png"
                  alt="Giải thưởng sự kiện"
                  width={800}
                  height={450}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-center">
        <p className="text-xs text-indigo-200">
          Admin sẽ liên hệ người trúng giải để xác minh và trao thưởng. 
          Anh em hãy chuẩn bị bằng chứng (ảnh chụp kết bạn FB, lịch sử mời bạn vào Zalo group...) nhé! 💪
        </p>
      </div>
    </div>
  );
}
