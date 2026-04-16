"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  User,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { formatCompactCurrency } from '@thc-efb/shared/constants';
import { BuybackPolicyContent } from "./BuybackPolicy";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@thc-efb/ui/responsive-dialog';

interface SellerInfo {
  name: string;
  avatarUrl?: string;
  transactionBoxUrl?: string;
  soldCount?: number;
  collateralAmount?: number;
}

interface BuyNowButtonProps {
  seller?: SellerInfo;
}

export function BuyNowButton({
  seller,
}: BuyNowButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800"
      >
        Liên hệ qua Box
      </button>

      <ResponsiveDialog open={open} onOpenChange={setOpen}>
        <ResponsiveDialogContent className="sm:max-w-md p-0 gap-0">
          <ResponsiveDialogHeader className="px-5 pt-5 pb-0">
            <ResponsiveDialogTitle>Hướng Dẫn Giao Dịch</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

          <BuyNowDialogBody seller={seller} />
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}

/** Shared dialog/drawer body — also used by StickyBuyBar */
export function BuyNowDialogBody({ seller }: { seller?: SellerInfo }) {
  return (
    <div className="overflow-y-auto px-5 py-4">
      {/* Safe transaction guide */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <div className="flex items-center gap-2 mb-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
            Giao dịch an toàn qua Box
          </h3>
        </div>
        <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-600 marker:text-emerald-500 marker:font-semibold dark:text-slate-400">
          <li>Tham gia <span className="font-semibold text-slate-900 dark:text-slate-100">Box Giao Dịch</span></li>
          <li>Thỏa thuận giá với người bán trong box</li>
          <li>Xác nhận giao dịch trước khi bàn giao tài khoản</li>
        </ol>
      </div>

      {/* Option 2: Third party */}
      <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
        hoặc
      </p>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
        Cũng có thể sử dụng admin lớn của các group game làm trung gian bên thứ 3. Phí do bên trung gian quy định.
      </p>

      {/* Warning */}
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-[11px] leading-relaxed font-medium text-amber-700 dark:text-amber-300">
          Shop <span className="font-bold">không chịu trách nhiệm</span> nếu giao dịch diễn ra ngoài Box liên hệ chính thức.
        </p>
      </div>

      <div className="my-4 border-t border-slate-100 dark:border-slate-700" />

      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Liên hệ giao dịch
      </p>

      {/* Seller */}
      {seller && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/5">
          <div className="flex items-center gap-3">
            {seller.avatarUrl ? (
              <Image src={seller.avatarUrl} alt={seller.name} width={40} height={40} className="h-10 w-10 rounded-xl object-cover shadow-sm" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 shadow-sm dark:bg-indigo-500/20">
                <User className="h-5 w-5 text-indigo-500" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Người bán</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {seller.name}
                {(seller.soldCount ?? 0) > 0 && (
                  <span className="ml-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">· {seller.soldCount} acc đã bán</span>
                )}
              </p>
            </div>
          </div>
          {(seller.collateralAmount ?? 0) > 0 && (
            <Link
              href="/bao-ke"
              className="mt-2.5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-500/20 dark:bg-emerald-500/10"
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="flex-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                Ký quỹ: <span className="font-bold">{formatCompactCurrency(seller.collateralAmount!)}</span>
              </span>
            </Link>
          )}
          {seller.transactionBoxUrl && (
            <a
              href={seller.transactionBoxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
              Tham gia Box Giao Dịch
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          )}
        </div>
      )}

      {/* Buyback policy */}
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
        <BuybackPolicyContent tierBg="bg-white dark:bg-slate-800" />
      </div>
    </div>
  );
}
