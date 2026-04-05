import { Bell, ArrowRight, Send } from "lucide-react";

export function TelegramNotify() {
  return (
    <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-sm dark:border-sky-500/20 dark:from-sky-950/40 dark:via-slate-800 dark:to-cyan-950/30">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-500/20">
          <Bell className="h-5 w-5 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Nhận thông báo acc mới
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tham gia kênh Telegram để nhận thông báo ngay khi có tài khoản mới
            phù hợp với bạn.
          </p>
        </div>
      </div>
      <a
        href="https://t.me/thc_efb_bot"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#2AABEE] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#229ED9] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
      >
        <Send className="h-4 w-4" />
        Tham gia kênh Telegram ngay
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}
