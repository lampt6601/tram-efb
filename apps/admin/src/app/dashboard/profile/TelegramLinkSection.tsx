"use client";

import { useState, useTransition } from "react";
import { Send, Unlink, Link, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { linkTelegramAccount, unlinkTelegramAccount } from "@/app/actions/profile-actions";

interface TelegramLinkSectionProps {
  currentTelegramUserId?: number | null;
}

export function TelegramLinkSection({ currentTelegramUserId }: TelegramLinkSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [inputId, setInputId] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleLink = () => {
    const id = parseInt(inputId.trim(), 10);
    if (!id || isNaN(id)) {
      toast.error("Vui lòng nhập ID Telegram hợp lệ.");
      return;
    }
    startTransition(async () => {
      try {
        await linkTelegramAccount(id);
        toast.success("Đã liên kết tài khoản Telegram thành công!");
        setShowInput(false);
        setInputId("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Liên kết thất bại.");
      }
    });
  };

  const handleUnlink = () => {
    startTransition(async () => {
      try {
        await unlinkTelegramAccount();
        toast.success("Đã hủy liên kết tài khoản Telegram.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Hủy liên kết thất bại.");
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Send className="h-4 w-4 text-sky-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Telegram Mini App
        </span>
      </div>

      {currentTelegramUserId ? (
        <div className="flex items-center justify-between rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-800 dark:bg-sky-900/20">
          <div>
            <p className="text-sm font-medium text-sky-800 dark:text-sky-200">
              Đã liên kết
            </p>
            <p className="text-xs text-sky-600 dark:text-sky-400">
              Telegram ID: {currentTelegramUserId}
            </p>
          </div>
          <button
            onClick={handleUnlink}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Unlink className="h-3.5 w-3.5" />
            )}
            Hủy liên kết
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Liên kết tài khoản Telegram để sử dụng Admin Dashboard ngay trong Telegram.
            Lấy ID của bạn bằng cách nhắn tin với{" "}
            <a
              href="https://t.me/userinfobot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 underline dark:text-sky-400"
            >
              @userinfobot
            </a>
            .
          </p>

          {!showInput ? (
            <button
              onClick={() => setShowInput(true)}
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700"
            >
              <Link className="h-4 w-4" />
              Liên kết Telegram
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="Nhập Telegram User ID"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                onKeyDown={(e) => e.key === "Enter" && handleLink()}
              />
              <button
                onClick={handleLink}
                disabled={isPending || !inputId.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xác nhận"}
              </button>
              <button
                onClick={() => { setShowInput(false); setInputId(""); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-400"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
