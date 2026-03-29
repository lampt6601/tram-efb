"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, BadgeCheck, Store, AlertTriangle, ShieldCheck } from "lucide-react";
import zaloIcon from "@/assets/icons/zalo.png";
import facebookIcon from "@/assets/icons/facebook.webp";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface SellerContactCardProps {
  sellerName: string;
  sellerAvatarUrl?: string | null;
  sellerSoldCount?: number | null;
  zaloContactUrl?: string;
  facebookContactUrl?: string;
}

export function SellerContactCard({
  sellerName,
  sellerAvatarUrl,
  sellerSoldCount,
  zaloContactUrl,
  facebookContactUrl,
}: SellerContactCardProps) {
  const [confirmLink, setConfirmLink] = useState<string | null>(null);

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
          </div>
        </div>
      </div>

      {/* Contact links — trigger confirm */}
      {(zaloContactUrl || facebookContactUrl) && (
        <div className="mt-2.5 flex gap-2">
          {zaloContactUrl && (
            <button
              onClick={() => setConfirmLink(zaloContactUrl)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Image src={zaloIcon} alt="Zalo" className="h-4 w-4 object-contain" />
              Zalo Người Bán
            </button>
          )}
          {facebookContactUrl && (
            <button
              onClick={() => setConfirmLink(facebookContactUrl)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              <Image src={facebookIcon} alt="Facebook" className="h-4 w-4 object-contain" />
              Facebook
            </button>
          )}
        </div>
      )}

      <Link
        href={`/shop/${encodeURIComponent(sellerName)}`}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-white/60 px-3 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-white dark:border-indigo-500/20 dark:bg-slate-800/50 dark:text-indigo-400 dark:hover:bg-slate-700"
      >
        <Store className="h-3.5 w-3.5" />
        Xem gian hàng
      </Link>

      {/* Confirm AlertDialog */}
      <AlertDialog open={!!confirmLink} onOpenChange={(open) => !open && setConfirmLink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Lưu ý quan trọng
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang liên hệ trực tiếp với <span className="font-semibold text-slate-900 dark:text-slate-100">Người Bán</span>, không phải Chủ Shop.
            </AlertDialogDescription>
            <p className="text-xs leading-relaxed font-semibold text-amber-700 dark:text-amber-300">
              Chủ shop <span className="font-bold">không chịu trách nhiệm</span> nếu giao dịch không thông qua chủ shop làm trung gian.
            </p>
          </AlertDialogHeader>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <p className="text-[11px] font-bold">Giao dịch an toàn qua Shop</p>
            </div>
            <ol className="mt-1.5 list-decimal pl-4 space-y-0.5 text-[11px] text-slate-600 marker:text-emerald-500 marker:font-semibold dark:text-slate-400">
              <li>Thỏa thuận giá với người bán</li>
              <li>Yêu cầu người bán tạo <span className="font-semibold">Box giao dịch có Chủ Shop</span></li>
              <li>Chủ Shop giữ tiền & xác nhận acc trước khi chuyển</li>
            </ol>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <button
              onClick={() => {
                if (confirmLink) window.open(confirmLink, "_blank", "noopener,noreferrer");
                setConfirmLink(null);
              }}
              className="flex-1 rounded-lg bg-amber-600 px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-amber-700"
            >
              Tôi đã hiểu, tiếp tục
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
