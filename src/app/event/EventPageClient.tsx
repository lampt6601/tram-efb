"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SpinWheelPreview } from "./SpinWheel";
import { NumberPickerForm } from "./NumberPickerForm";
import { EventInfo } from "./EventInfo";
import { WinnerAnnouncement } from "./WinnerAnnouncement";

interface EventEntry {
  id: string;
  zalo_name: string;
  facebook_name: string;
  number: number;
  created_at: string;
}

interface EventResult {
  prize_type: string;
  winning_number: number;
  zalo_name: string;
  facebook_name: string;
}

interface EventPageClientProps {
  entries: EventEntry[];
  results: EventResult[];
}

export default function EventPageClient({ entries, results }: EventPageClientProps) {
  const router = useRouter();
  const [showAllNumbers, setShowAllNumbers] = useState(false);

  const bothPrizesConfirmed = results.length >= 2;
  const takenNumbers = entries.map((e) => e.number);

  const handleSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  // Sort taken numbers for display
  const sortedEntries = [...entries].sort((a, b) => a.number - b.number);
  const displayEntries = showAllNumbers ? sortedEntries : sortedEntries.slice(0, 30);

  return (
    <>
      {/* Hero */}
      <section className="gradient-bg relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.15)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.1)_0%,_transparent_60%)]" />
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-indigo-400/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-8 text-center sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
            <span className="text-xs font-bold tracking-wide text-yellow-300">
              🚀 BIG EVENT
            </span>
          </div>
          <h1 className="text-balance text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            MỪNG THC EFB CÁN MỐC
            <span className="mt-1 block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              1K VISITOR & 100 ANH EM ZALO
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/60 sm:text-base">
            Minigame quay số trúng thưởng cây nhà lá vườn ngay trên hệ thống website của shop.
            Trúng là bế acc về đá ngay! 🎮⚽
          </p>
        </div>
      </section>

      {/* Winner Announcement (when both prizes confirmed) */}
      {bothPrizesConfirmed && (
        <section className="gradient-bg relative border-t border-white/5">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <WinnerAnnouncement results={results} />
          </div>
        </section>
      )}

      {/* Main Content: Wheel Preview + Form */}
      <section className="gradient-bg relative border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left: Spin Wheel Preview */}
            <div className="flex flex-col items-center justify-start">
              <h2 className="mb-6 text-center text-lg font-bold text-white sm:text-xl">
                🎰 Vòng Quay May Mắn
              </h2>
              <SpinWheelPreview
                pickedNumbers={entries.map((e) => ({
                  number: e.number,
                  zalo_name: e.zalo_name,
                }))}
              />
            </div>

            {/* Right: Number Picker or Results */}
            <div className="space-y-6">
              {!bothPrizesConfirmed && (
                <NumberPickerForm
                  takenNumbers={takenNumbers}
                  onSuccess={handleSuccess}
                />
              )}

              {/* Taken Numbers */}
              {entries.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white/70">
                    <span className="text-lg">🎯</span> Số Đã Được Chọn ({entries.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-6">
                    {displayEntries.map((e) => (
                      <div
                        key={e.id}
                        className="group relative flex flex-col items-center rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10"
                        title={`Zalo: ${e.zalo_name} | FB: ${e.facebook_name}`}
                      >
                        <span className="text-sm font-bold text-indigo-400">
                          {e.number}
                        </span>
                        <span className="max-w-full truncate text-[9px] text-white/40">
                          {e.zalo_name}
                        </span>
                      </div>
                    ))}
                  </div>
                  {sortedEntries.length > 30 && !showAllNumbers && (
                    <button
                      onClick={() => setShowAllNumbers(true)}
                      className="mt-2 text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Xem tất cả ({sortedEntries.length} số)...
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Event Info */}
      <section className="gradient-bg relative border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <EventInfo />
        </div>
      </section>

      {/* Community CTA */}
      <section className="gradient-bg relative border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6 sm:py-12 lg:px-8">
          <p className="text-sm text-white/50 sm:text-base">
            Cộng đồng chơi game vui vẻ, anh em cứ chơi đẹp, tự giác để Admin có động lực
            tổ chức thêm nhiều event lớn mạnh hơn về sau nhé! 💪🔥
          </p>
        </div>
      </section>
    </>
  );
}
