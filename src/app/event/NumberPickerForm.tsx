"use client";

import { useState, useTransition } from "react";
import { User, Hash, Check, Loader2 } from "lucide-react";
import { submitEventEntry } from "@/app/actions/event-actions";

const MAX_NUMBER = 199;

interface NumberPickerFormProps {
  takenNumbers: number[];
  onSuccess: () => void;
}

export function NumberPickerForm({ takenNumbers, onSuccess }: NumberPickerFormProps) {
  const [zaloName, setZaloName] = useState("");
  const [fbName, setFbName] = useState("");
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const num = parseInt(cleaned, 10);
    if (cleaned && (num < 1 || num > MAX_NUMBER)) return;
    setNumber(cleaned);
    setError("");
  };

  const handleSubmit = () => {
    setError("");

    if (!zaloName.trim()) {
      setError("Vui lòng nhập tên Zalo của bạn.");
      return;
    }
    if (!fbName.trim()) {
      setError("Vui lòng nhập tên Facebook của bạn.");
      return;
    }

    const num = parseInt(number, 10);
    if (isNaN(num) || num < 1 || num > MAX_NUMBER) {
      setError(`Số phải nằm trong khoảng 1 – ${MAX_NUMBER}.`);
      return;
    }

    if (takenNumbers.includes(num)) {
      setError(`Số ${num} đã được người khác chọn rồi!`);
      return;
    }

    startTransition(async () => {
      const result = await submitEventEntry(zaloName.trim(), fbName.trim(), num);
      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
        onSuccess();
      }
    });
  };

  const handleReset = () => {
    setSubmitted(false);
    setNumber("");
    setError("");
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center backdrop-blur-sm">
        <div className="mb-2 text-3xl">✅</div>
        <p className="text-sm font-semibold text-emerald-300">
          Đã ghi nhận số <span className="text-white font-bold">{number}</span> thành công!
        </p>
        <p className="mt-1 text-xs text-emerald-200/60">
          Chúc bạn may mắn! 🍀
        </p>
        <button
          onClick={handleReset}
          className="mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/10"
        >
          Chọn thêm số (nếu bạn còn lượt)
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
      <h3 className="mb-4 text-base font-bold text-white sm:text-lg">
        📝 Chọn Số May Mắn Của Bạn
      </h3>

      {/* Zalo Name */}
      <div className="mb-3">
        <label className="mb-1.5 block text-xs font-medium text-white/60">
          Tên Zalo <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <User className="h-4 w-4 text-emerald-400" />
          <input
            type="text"
            value={zaloName}
            onChange={(e) => setZaloName(e.target.value)}
            placeholder="Nhập đúng tên Zalo của bạn..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Facebook Name */}
      <div className="mb-3">
        <label className="mb-1.5 block text-xs font-medium text-white/60">
          Tên Facebook <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <User className="h-4 w-4 text-blue-400" />
          <input
            type="text"
            value={fbName}
            onChange={(e) => setFbName(e.target.value)}
            placeholder="Nhập đúng tên Facebook của bạn..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Number input */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-white/60">
          Chọn số (1 – {MAX_NUMBER}) <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <Hash className="h-4 w-4 text-indigo-400" />
          <input
            type="text"
            inputMode="numeric"
            value={number}
            onChange={(e) => handleNumberChange(e.target.value)}
            placeholder="Nhập con số bạn muốn chọn..."
            className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30"
            maxLength={3}
          />
        </div>
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
            XÁC NHẬN CHỌN SỐ
          </>
        )}
      </button>
    </div>
  );
}
