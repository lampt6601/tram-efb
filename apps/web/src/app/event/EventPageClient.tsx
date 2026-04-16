"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const PAGE_SIZE = 20;

function fmtDate(d: string) {
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventPageClient({ entries, results }: EventPageClientProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const grandConfirmed = !!results.find((r) => r.prize_type === "grand");
  const uniqueNumbers = Array.from(new Set(entries.map((e) => e.number))).sort((a, b) => a - b);

  const handleSuccess = useCallback(() => {
    router.refresh();
    setPage(1);
  }, [router]);

  // Group entries by person (name). One row per person.
  const personMap = new Map<
    string,
    { name: string; numbers: number[]; earliest: string; latest: string }
  >();

  for (const e of entries) {
    const name = (e.zalo_name || e.facebook_name || "").trim() || "—";
    const existing = personMap.get(name);
    if (!existing) {
      personMap.set(name, {
        name,
        numbers: [e.number],
        earliest: e.created_at,
        latest: e.created_at,
      });
    } else {
      existing.numbers.push(e.number);
      if (new Date(e.created_at).getTime() < new Date(existing.earliest).getTime()) {
        existing.earliest = e.created_at;
      }
      if (new Date(e.created_at).getTime() > new Date(existing.latest).getTime()) {
        existing.latest = e.created_at;
      }
    }
  }

  const people = Array.from(personMap.values()).sort(
    (a, b) => new Date(b.latest).getTime() - new Date(a.latest).getTime(),
  );

  const totalPages = Math.max(1, Math.ceil(people.length / PAGE_SIZE));
  const pagePeople = people.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                left: `${(i * 7 + 3) % 100}%`,
                top: `${(i * 11 + 7) % 100}%`,
                animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${(i % 3)}s`,
              }}
            />
          ))}
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-8 text-center sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
            <span className="text-xs font-bold tracking-wide text-yellow-300">
              🚀 EVENT
            </span>
          </div>
          <h1 className="text-balance text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            MỪNG SẠP ACC EFOOTBALL CÁN MỐC
            <span className="mt-1 block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              2K USER & 100 ANH EM ZALO
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/60 sm:text-base">
            Minigame quay số trúng thưởng ngay trên hệ thống website của shop.
            Trúng là bế acc về đá ngay! 🎮⚽
          </p>
        </div>
      </section>

      {/* Winner Announcement */}
      {grandConfirmed && (
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
                pickedNumbers={uniqueNumbers.map((n) => ({ number: n, zalo_name: "" }))}
              />
            </div>

            {/* Right: Number Picker Form */}
            <div className="space-y-6">
              {!grandConfirmed && (
                <NumberPickerForm
                  onSuccess={handleSuccess}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Entries Table */}
      {entries.length > 0 && (
        <section className="gradient-bg relative border-t border-white/5">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
              <span className="text-2xl">🎯</span> Danh Sách Số Đã Đăng Ký
              <span className="ml-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-sm font-semibold text-indigo-300">
                {people.length} người • {entries.length} lượt
              </span>
            </h2>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              {/* Table header */}
              <div className="grid grid-cols-[3rem_1fr_5rem_1fr_1fr] gap-x-3 border-b border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/40 sm:px-6">
                <span>STT</span>
                <span>Tên Zalo/Facebook</span>
                <span className="text-center">Số lượt</span>
                <span>Các số</span>
                <span className="hidden sm:block">Cập nhật</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5">
                {pagePeople.map((p, idx) => {
                  const uniqueNums = Array.from(new Set(p.numbers)).sort((a, b) => a - b);
                  return (
                  <div
                    key={p.name}
                    className="grid grid-cols-[3rem_1fr_5rem_1fr_1fr] items-center gap-x-3 px-4 py-3 text-sm transition-colors hover:bg-white/5 sm:px-6"
                  >
                    <span className="text-xs text-white/30">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </span>
                    <span className="truncate font-medium text-white">
                      {p.name}
                    </span>
                    <span className="text-center text-sm font-bold text-indigo-300">
                      {p.numbers.length}
                    </span>
                    <div className="flex flex-wrap gap-1.5 py-1">
                      {uniqueNums.slice(0, 12).map((n) => (
                        <span
                          key={n}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-semibold text-white/70"
                        >
                          {n}
                        </span>
                      ))}
                      {uniqueNums.length > 12 && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/50">
                          +{uniqueNums.length - 12}
                        </span>
                      )}
                    </div>
                    <span className="hidden text-xs text-white/40 sm:block">
                      {fmtDate(p.latest)}
                    </span>
                  </div>
                )})}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1
                  ) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-indigo-500 text-white"
                            : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (Math.abs(p - page) === 2) {
                    return (
                      <span key={p} className="text-white/30">
                        …
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

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
