"use client";

import { useEffect, useState, useRef } from "react";
import { formatCompactCurrency } from '@thc-efb/shared/constants';
import { ShieldCheck } from "lucide-react";

interface StickyBuyBarProps {
  price: number;
  isDeposited?: boolean;
  isSale?: boolean;
  seller?: {
    name: string;
    transactionBoxUrl?: string;
  };
}

export function StickyBuyBar({
  price,
  isDeposited,
  isSale,
  seller,
}: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const contactUrl = seller?.transactionBoxUrl;

  return (
    <>
      {/* Sentinel — placed near the original Buy button */}
      <div ref={sentinelRef} className="h-0 w-0" aria-hidden />

      {/* Sticky bar — mobile only */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur-md transition-transform duration-300 dark:border-slate-700 dark:bg-slate-900/95 md:hidden ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          {/* Price */}
          <div className="min-w-0">
            <p
              className={`text-lg font-extrabold ${isSale ? "text-rose-600 dark:text-rose-400" : "text-indigo-600 dark:text-indigo-400"}`}
            >
              {formatCompactCurrency(price)}
            </p>
            <p className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              Qua trung gian
            </p>
          </div>

          {/* CTA */}
          {isDeposited ? (
            <span className="ml-auto shrink-0 rounded-xl bg-blue-100 px-5 py-2.5 text-sm font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              Đang được cọc
            </span>
          ) : contactUrl ? (
            <a
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto shrink-0 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-colors hover:bg-indigo-700 active:scale-95"
            >
              Mua ngay
            </a>
          ) : (
            <a
              href={`https://zalo.me/g/umniisdttnw5kcubv74y`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto shrink-0 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-colors hover:bg-indigo-700 active:scale-95"
            >
              Mua ngay
            </a>
          )}
        </div>
      </div>
    </>
  );
}
