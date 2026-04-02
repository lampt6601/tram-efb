import Image from "next/image";
import { Bell, ArrowRight } from "lucide-react";
import zaloIcon from "@/assets/icons/zalo.png";

export function ZaloNotify() {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm dark:border-indigo-500/20 dark:from-indigo-950/40 dark:via-slate-800 dark:to-purple-950/30">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20">
          <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Nhận thông báo acc mới
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tham gia Box Zalo để nhận thông báo ngay khi có tài khoản mới phù
            hợp với bạn.
          </p>
        </div>
      </div>
      <a
        href="https://zalo.me/g/umniisdttnw5kcubv74y"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
          <Image
            src={zaloIcon}
            alt="Zalo"
            className="h-4 w-4 object-contain"
          />
        </span>
        Tham gia Box Zalo ngay
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}
