"use client";

import { useRef, useCallback, useEffect } from "react";

interface SpinWheelPreviewProps {
  pickedNumbers: { number: number; zalo_name: string }[];
}

const WHEEL_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
];

export function SpinWheelPreview({ pickedNumbers }: SpinWheelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const segments = pickedNumbers.length > 0
    ? pickedNumbers
    : [{ number: 0, zalo_name: "---" }];

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 380;
    const center = size / 2;
    const radius = center - 8;
    const segCount = segments.length;
    const arc = (2 * Math.PI) / segCount;

    ctx.clearRect(0, 0, size * 3, size * 3);

    // Shadow
    ctx.save();
    ctx.shadowColor = "rgba(99, 102, 241, 0.4)";
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#1e1b4b";
    ctx.fill();
    ctx.restore();

    // Segments
    for (let i = 0; i < segCount; i++) {
      const angle = i * arc - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.max(10, Math.min(16, 200 / segCount))}px sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 3;
      ctx.fillText(String(segments[i].number || "?"), radius - 15, 5);
      ctx.restore();
    }

    // Center circle
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, 30);
    gradient.addColorStop(0, "#6366f1");
    gradient.addColorStop(1, "#4f46e5");
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center text
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("THC EFB", center, center);

    // Outer ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 2, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Tick marks
    for (let i = 0; i < segCount; i++) {
      const angle = i * arc - Math.PI / 2;
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(radius - 5, 0);
      ctx.lineTo(radius + 3, 0);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }, [segments]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 380 * dpr;
    canvas.height = 380 * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      drawWheel();
    }
  }, [drawWheel]);

  return (
    <div className="flex flex-col items-center">
      {/* Pointer */}
      <div className="relative z-10 mb-[-14px]">
        <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[22px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-[0_2px_8px_rgba(250,204,21,0.5)]" />
      </div>

      {/* Wheel Canvas (no interaction) */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="h-[280px] w-[280px] sm:h-[340px] sm:w-[340px]"
          style={{ width: 340, height: 340 }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_60px_rgba(99,102,241,0.3)]" />
      </div>

      <div className="mt-3 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5">
        <p className="text-xs text-indigo-300">
          {segments[0]?.number === 0
            ? "Chưa có ai chọn số"
            : `${segments.length} số đã được chọn • Chỉ Admin mới quay được`}
        </p>
      </div>
    </div>
  );
}
