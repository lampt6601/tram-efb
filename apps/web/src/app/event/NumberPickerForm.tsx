"use client";

import { useState, useTransition } from "react";
import { User, Hash, Check, Loader2 } from "lucide-react";
import { submitMultipleEventEntries } from "@/app/actions/event-actions";

const MAX_NUMBER = 199;
const MAX_SLOTS = 10;

interface NumberPickerFormProps {
  onSuccess: () => void;
}

export function NumberPickerForm({ onSuccess }: NumberPickerFormProps) {
  const [name, setName] = useState("");
  const [slotCount, setSlotCount] = useState(1);
  const [numbers, setNumbers] = useState<string[]>([""]);
  const [error, setError] = useState("");
  const [submittedNumbers, setSubmittedNumbers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSlotCountChange = (count: number) => {
    setSlotCount(count);
    setNumbers((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array<string>(count - prev.length).fill("")];
      }
      return prev.slice(0, count);
    });
    setError("");
  };

  const handleNumberChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const num = parseInt(cleaned, 10);
    if (cleaned && (num < 1 || num > MAX_NUMBER)) return;
    setNumbers((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    setError("");
  };

  const handleSubmit = () => {
    setError("");

    if (!name.trim()) {
      setError("Vui lòng nhập tên Zalo hoặc Facebook của bạn.");
      return;
    }

    const parsed: number[] = [];
    for (let i = 0; i < slotCount; i++) {
      const num = parseInt(numbers[i] ?? "", 10);
      if (isNaN(num) || num < 1 || num > MAX_NUMBER) {
        setError(`Số thứ ${i + 1} phải nằm trong khoảng 1 – ${MAX_NUMBER}.`);
        return;
      }
      if (parsed.includes(num)) {
        setError(`Bạn đã nhập số ${num} hai lần. Mỗi số phải khác nhau.`);
        return;
      }
      parsed.push(num);
    }

    startTransition(async () => {
      const trimmed = name.trim();
      const result = await submitMultipleEventEntries(trimmed, trimmed, parsed);
      if (result.error) {
        setError(result.error);
      } else {
        setSubmittedNumbers(parsed);
        setSubmitted(true);
        onSuccess();
      }
    });
  };

  const handleReset = () => {
    setSubmitted(false);
    setNumbers([""]);
    setSlotCount(1);
    setError("");
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center backdrop-blur-sm">
        <div className="mb-2 text-3xl">✅</div>
        <p className="text-sm font-semibold text-emerald-300">
          Đã ghi nhận {submittedNumbers.length} số thành công!
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {submittedNumbers.map((n) => (
            <span
              key={n}
              className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-300"
            >
              {n}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-emerald-200/60">Chúc bạn may mắn! 🍀</p>
        <button
          onClick={handleReset}
          className="mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/10"
        >
          Điền lần nữa
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
      <h3 className="mb-4 text-base font-bold text-white sm:text-lg">
        📝 Chọn Số May Mắn Của Bạn
      </h3>

      {/* Name */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-white/60">
          Tên Zalo hoặc Facebook <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <User className="h-4 w-4 shrink-0 text-indigo-400" />
          <input
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Nhập tên Zalo hoặc Facebook của bạn..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Slot Count Selector */}
      <div className="mb-4">
        <label className="mb-2 block text-xs font-medium text-white/60">
          Số lượt của bạn{" "}
          <span className="text-white/40">(theo điều kiện bên dưới)</span>{" "}
          <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: MAX_SLOTS }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleSlotCountChange(n)}
              className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${
                slotCount === n
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                  : "border border-white/10 bg-white/5 text-white/50 hover:border-indigo-500/40 hover:text-white"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-white/30">
          Tối đa {MAX_SLOTS} lượt. Tự giác tính dựa trên điều kiện phía dưới nhé!
        </p>
      </div>

      {/* Number Inputs */}
      <div className="mb-4 space-y-2">
        <label className="mb-1.5 block text-xs font-medium text-white/60">
          Số may mắn (1 – {MAX_NUMBER}){" "}
          <span className="text-white/40">— mỗi số phải khác nhau</span>{" "}
          <span className="text-red-400">*</span>
        </label>
        {Array.from({ length: slotCount }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
          >
            <span className="shrink-0 text-xs font-bold text-indigo-400/70">#{i + 1}</span>
            <Hash className="h-4 w-4 shrink-0 text-indigo-400" />
            <input
              type="text"
              inputMode="numeric"
              value={numbers[i] ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange(i, e.target.value)}
              placeholder={`Nhập số thứ ${i + 1}...`}
              className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30"
              maxLength={3}
            />
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          ⚠️ {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang gửi...
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            XÁC NHẬN {slotCount} SỐ
          </>
        )}
      </button>
    </div>
  );
}
