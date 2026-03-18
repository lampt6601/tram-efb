"use client";

import { useRef, useCallback, useEffect, useState, useTransition } from "react";
import { Trophy, RotateCcw, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { confirmPrize, clearPrize, deleteEventEntry } from "@/app/actions/event-actions";

interface Entry {
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

interface SpinWheelAdminProps {
  entries: Entry[];
  results: EventResult[];
}

const WHEEL_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
];

const SPIN_DURATION = 6000;

function fmtDate(d: string) {
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SpinWheelAdmin({ entries, results: initialResults }: SpinWheelAdminProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Entry | null>(null);
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState(initialResults);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localEntries, setLocalEntries] = useState(entries);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const numberSegments = Array.from(new Set(localEntries.map((e) => e.number))).sort(
    (a, b) => a - b,
  );

  const grandResult = results.find((r) => r.prize_type === "grand");

  const getEarliestEntryForNumber = useCallback(
    (num: number): Entry | null => {
      const matches = localEntries.filter((e) => e.number === num);
      if (matches.length === 0) return null;
      return matches.reduce((earliest, cur) =>
        new Date(cur.created_at).getTime() < new Date(earliest.created_at).getTime()
          ? cur
          : earliest,
      );
    },
    [localEntries],
  );

  const drawWheel = useCallback(
    (rotation = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = 400;
      const center = size / 2;
      const radius = center - 10;
      const segCount = numberSegments.length;

      ctx.clearRect(0, 0, size, size);

      if (segCount === 0) {
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#1e1b4b";
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Chưa có số nào", center, center);
        return;
      }

      const arc = (2 * Math.PI) / segCount;
      const rotRad = (rotation * Math.PI) / 180;

      // Shadow
      ctx.save();
      ctx.shadowColor = "rgba(99, 102, 241, 0.5)";
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#1e1b4b";
      ctx.fill();
      ctx.restore();

      // Segments
      for (let i = 0; i < segCount; i++) {
        const startAngle = i * arc - Math.PI / 2 + rotRad;
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, startAngle + arc);
        ctx.closePath();
        ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        const fontSize = Math.max(8, Math.min(14, 280 / segCount));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 4;
        ctx.fillText(String(numberSegments[i]), radius - 12, 4);
        ctx.restore();
      }

      // Outer ring
      ctx.beginPath();
      ctx.arc(center, center, radius + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 5;
      ctx.stroke();

      // Center circle
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, 34);
      gradient.addColorStop(0, "#818cf8");
      gradient.addColorStop(1, "#4338ca");
      ctx.beginPath();
      ctx.arc(center, center, 34, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("THC EFB", center, center);
    },
    [numberSegments],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr;
    canvas.height = 400 * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    drawWheel(rotationRef.current);
  }, [drawWheel]);

  const handleSpin = () => {
    if (isSpinning || numberSegments.length === 0) return;

    const segCount = numberSegments.length;
    const segDeg = 360 / segCount;

    // Pick random winner index
    const winnerIdx = Math.floor(Math.random() * segCount);

    // Calculate rotation needed to bring winnerIdx to the top pointer
    // Pointer is at top (0° from top). Segment i center is at (i + 0.5) * segDeg from top.
    // To bring segment i to top, we need effective rotation = (360 - (i + 0.5) * segDeg) % 360
    const targetEffective = (360 - (winnerIdx + 0.5) * segDeg + 360) % 360;
    const currentEffective = ((rotationRef.current % 360) + 360) % 360;
    let delta = (targetEffective - currentEffective + 360) % 360;
    if (delta < segDeg) delta += 360; // ensure at least one full segment forward

    const fullSpins = (5 + Math.floor(Math.random() * 4)) * 360;
    const newRotation = rotationRef.current + fullSpins + delta;

    rotationRef.current = newRotation;
    setWinner(null);
    setIsSpinning(true);

    // Animate canvas manually for smooth easing
    const startRotation = newRotation - fullSpins - delta;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      // Ease out quint
      const eased = 1 - Math.pow(1 - progress, 5);
      const current = startRotation + (newRotation - startRotation) * eased;
      drawWheel(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        drawWheel(newRotation);
        setIsSpinning(false);
        const winningNumber = numberSegments[winnerIdx];
        setWinner(getEarliestEntryForNumber(winningNumber));
      }
    };
    requestAnimationFrame(animate);
  };

  const handleConfirmPrize = () => {
    if (!winner) return;
    startTransition(async () => {
      await confirmPrize("grand", winner.number);
      setResults((prev) => {
        const filtered = prev.filter((r) => r.prize_type !== "grand");
        return [
          ...filtered,
          {
            prize_type: "grand",
            winning_number: winner.number,
            zalo_name: winner.zalo_name,
            facebook_name: winner.facebook_name,
          },
        ];
      });
    });
  };

  const handleClearPrize = () => {
    startTransition(async () => {
      await clearPrize("grand");
      setResults((prev) => prev.filter((r) => r.prize_type !== "grand"));
    });
  };

  const handleDeleteEntry = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteEventEntry(id);
      setLocalEntries((prev) => prev.filter((e) => e.id !== id));
      setDeletingId(null);
    });
  };

  const totalPages = Math.max(1, Math.ceil(localEntries.length / PAGE_SIZE));
  const pageEntries = [...localEntries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <Trophy className="h-4 w-4 text-amber-600" />
        <p className="text-sm font-semibold text-amber-800">
          Chỉ có <span className="font-black">1 giải duy nhất</span> (Grand) — xác nhận kết quả để hiển thị lên trang /event
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left: Spin Wheel */}
        <div className={`flex flex-col items-center ${winner ? "order-2 lg:order-none" : ""}`}>
          {/* Pointer */}
          <div className="relative z-10 mb-[-16px]">
            <div className="h-0 w-0 border-l-[16px] border-r-[16px] border-t-[26px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-[0_2px_10px_rgba(250,204,21,0.6)]" />
          </div>

          {/* Canvas */}
          <div className="relative rounded-full">
            <canvas
              ref={canvasRef}
              className="rounded-full"
              style={{ width: 380, height: 380 }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_80px_rgba(99,102,241,0.25)]" />
          </div>

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || numberSegments.length === 0}
            className={`mt-6 flex items-center gap-3 rounded-2xl px-10 py-4 text-base font-black tracking-wide shadow-lg transition-all ${
              isSpinning || numberSegments.length === 0
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-300 hover:scale-[1.04] hover:shadow-xl active:scale-95"
            }`}
          >
            {isSpinning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang quay...
              </>
            ) : (
              <>
                <RotateCcw className="h-5 w-5" />
                QUAY SỐ
              </>
            )}
          </button>

          <p className="mt-2 text-xs text-slate-400">
            {numberSegments.length === 0
              ? "Chưa có số nào được đăng ký"
              : `${numberSegments.length} số (unique) • ${localEntries.length} lượt`}
          </p>
        </div>

        {/* Right: Winner + Results panel */}
        <div className={`space-y-5 ${winner ? "order-1 lg:order-none" : ""}`}>
          {/* Winner reveal */}
          {winner && (
            <div className="animate-in fade-in slide-in-from-bottom-4 rounded-2xl border-2 border-yellow-400/60 bg-gradient-to-br from-yellow-50 to-amber-50 p-5 shadow-lg">
              <div className="mb-3 text-center text-4xl">🎉</div>
              <h3 className="mb-1 text-center text-sm font-bold uppercase tracking-wider text-amber-600">
                Kết quả vòng quay
              </h3>
              <div className="mt-3 rounded-xl bg-white/80 p-4 text-center">
                <div className="mb-1 text-5xl font-black text-indigo-600">
                  #{winner.number}
                </div>
                <p className="text-base font-bold text-slate-800">{winner.zalo_name}</p>
                <p className="text-sm text-slate-500">{winner.facebook_name}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleConfirmPrize}
                  disabled={isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-600 disabled:opacity-60"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Xác nhận trúng giải
                </button>
                <button
                  onClick={() => setWinner(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-slate-50"
                >
                  Quay lại
                </button>
              </div>
            </div>
          )}

          {/* Confirmed Results */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-700">
              🏆 Kết Quả Đã Xác Nhận
            </h3>
            <div className="space-y-3">
              {/* Grand Prize */}
              <div
                className={`rounded-xl border p-3 ${grandResult ? "border-amber-200 bg-amber-50" : "border-dashed border-slate-200 bg-slate-50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600">🥇 Giải duy nhất (Grand)</span>
                  {grandResult && (
                    <button
                      onClick={handleClearPrize}
                      disabled={isPending}
                      className="text-red-400 hover:text-red-600 disabled:opacity-40"
                      title="Xóa kết quả"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {grandResult ? (
                  <div className="mt-1.5">
                    <span className="text-xl font-black text-amber-700">
                      #{grandResult.winning_number}
                    </span>
                    <p className="text-sm font-semibold text-slate-700">{grandResult.zalo_name}</p>
                    <p className="text-xs text-slate-500">{grandResult.facebook_name}</p>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">Chưa có kết quả</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
            📋 Danh sách tham gia
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              {localEntries.length}
            </span>
          </h3>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[2.5rem_1fr_1fr_3.5rem_1fr_2.5rem] border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>#</span>
            <span>Zalo</span>
            <span>Facebook</span>
            <span className="text-center">Số</span>
            <span>Thời gian</span>
            <span />
          </div>
          <div className="divide-y divide-slate-50">
            {pageEntries.map((entry, idx) => (
              <div
                key={entry.id}
                className="grid grid-cols-[2.5rem_1fr_1fr_3.5rem_1fr_2.5rem] items-center px-4 py-2.5 text-sm hover:bg-slate-50"
              >
                <span className="text-xs text-slate-300">
                  {(page - 1) * PAGE_SIZE + idx + 1}
                </span>
                <span className="truncate font-medium text-slate-800">{entry.zalo_name}</span>
                <span className="truncate text-slate-500">{entry.facebook_name}</span>
                <span className="text-center text-base font-bold text-indigo-600">{entry.number}</span>
                <span className="text-xs text-slate-400">{fmtDate(entry.created_at)}</span>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  disabled={deletingId === entry.id || isPending}
                  className="flex items-center justify-center text-slate-300 transition-colors hover:text-red-500 disabled:opacity-40"
                  title="Xóa"
                >
                  {deletingId === entry.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
            {localEntries.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">
                Chưa có ai đăng ký số
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  p === page
                    ? "bg-indigo-500 text-white"
                    : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
