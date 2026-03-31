"use client";

import Image from "next/image";
import Link from "next/link";
import { User, BadgeCheck, Store, MessageCircle, ExternalLink } from "lucide-react";
import { CollateralBadge } from "./CollateralBadge";

interface SellerContactCardProps {
  sellerName: string;
  sellerAvatarUrl?: string | null;
  sellerSoldCount?: number | null;
  sellerCollateralAmount?: number | null;
  transactionBoxUrl?: string;
}

export function SellerContactCard({
  sellerName,
  sellerAvatarUrl,
  sellerSoldCount,
  sellerCollateralAmount,
  transactionBoxUrl,
}: SellerContactCardProps) {
  return (
    <div className="mb-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/5">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          {sellerAvatarUrl ? (
            <Image
              src={sellerAvatarUrl}
              alt={sellerName}
              width={44}
              height={44}
              className="h-11 w-11 rounded-2xl object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 shadow-sm dark:bg-indigo-500/20">
              <User className="h-5 w-5 text-indigo-500" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Người bán
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {sellerName}
            </p>
            {(sellerSoldCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <BadgeCheck className="h-3 w-3" />
                Đã bán {sellerSoldCount} acc
              </span>
            )}
            {(sellerCollateralAmount ?? 0) > 0 && (
              <CollateralBadge amount={sellerCollateralAmount!} />
            )}
          </div>
        </div>
      </div>

      {/* Box Giao Dịch link */}
      {transactionBoxUrl && (
        <a
          href={transactionBoxUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          <MessageCircle className="h-4 w-4" />
          Tham gia Box Giao Dịch
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      )}

      <Link
        href={`/shop/${encodeURIComponent(sellerName)}`}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-white/60 px-3 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-white dark:border-indigo-500/20 dark:bg-slate-800/50 dark:text-indigo-400 dark:hover:bg-slate-700"
      >
        <Store className="h-3.5 w-3.5" />
        Xem gian hàng
      </Link>
    </div>
  );
}
