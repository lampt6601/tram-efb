"use client";

import { useSearchParams } from "next/navigation";
import { ShieldAlert, ExternalLink } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  no_init_data:
    "Không tìm thấy dữ liệu Telegram. Hãy mở app này từ bên trong Telegram.",
  "Tài khoản Telegram chưa được liên kết với admin nào.":
    "Tài khoản Telegram của bạn chưa được liên kết. Hãy đăng nhập vào Admin Dashboard và liên kết tài khoản tại trang Hồ Sơ.",
  "Invalid Telegram init data":
    "Dữ liệu xác thực không hợp lệ hoặc đã hết hạn. Vui lòng mở lại app.",
};

export function AuthErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "auth_failed";
  const message =
    ERROR_MESSAGES[decodeURIComponent(reason)] ??
    "Không thể xác thực. Vui lòng thử lại sau.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/10">
        <ShieldAlert className="h-7 w-7 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Không thể đăng nhập
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          {message}
        </p>
      </div>
      <a
        href="https://admin.thc-efb.com/dashboard/profile"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
      >
        <ExternalLink className="h-4 w-4" />
        Mở Admin Dashboard
      </a>
    </div>
  );
}
