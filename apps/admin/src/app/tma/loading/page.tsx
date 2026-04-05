"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function TmaAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/tma/dashboard";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function authenticate() {
      try {
        // Wait briefly for Telegram WebApp to initialize (handles redirect timing)
        let initData = window.Telegram?.WebApp?.initData;
        if (!initData) {
          await new Promise((r) => setTimeout(r, 500));
          initData = window.Telegram?.WebApp?.initData;
        }

        if (!initData) {
          // Dev mode: show debug info instead of silent redirect
          if (process.env.NODE_ENV === "development") {
            console.warn("TMA: no initData. window.Telegram =", window.Telegram);
          }
          router.replace("/tma/auth-error?reason=no_init_data");
          return;
        }

        const res = await fetch("/api/tma/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });

        const data = await res.json();

        if (res.ok && data.ok) {
          router.replace(decodeURIComponent(from));
        } else {
          const reason = encodeURIComponent(data.error ?? "auth_failed");
          router.replace(`/tma/auth-error?reason=${reason}`);
        }
      } catch (err) {
        console.error("TMA auth error:", err);
        setError("Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.");
      }
    }

    authenticate();
  }, [from, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Đang xác thực...</p>
    </div>
  );
}

export default function TmaLoadingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      }
    >
      <TmaAuthContent />
    </Suspense>
  );
}
