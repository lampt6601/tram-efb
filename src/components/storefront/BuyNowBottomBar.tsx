"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  MessageCircle,
  User,
  AlertTriangle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import zaloIcon from "@/assets/icons/zalo.png";
import facebookIcon from "@/assets/icons/facebook.webp";

interface SellerInfo {
  name: string;
  avatarUrl?: string;
  zaloLink?: string;
  facebookLink?: string;
  soldCount?: number;
}

interface BuyNowBottomBarProps {
  formattedPrice: string;
  isSale: boolean;
  contactMessage: string;
  ownerZaloUrl: string;
  ownerFacebookUrl: string;
  seller?: SellerInfo;
  zaloGroupUrl: string;
  zaloBoxUrl: string;
  totalSoldCount: number;
}

export function BuyNowBottomBar({
  formattedPrice,
  isSale,
  seller,
  zaloGroupUrl,
}: BuyNowBottomBarProps) {
  const [open, setOpen] = useState(false);
  const [confirmLink, setConfirmLink] = useState<string | null>(null);

  return (
    <>
      {/* Sticky bottom bar — mobile only */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur-md lg:hidden dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          {/* Price */}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Giá Bán
            </p>
            <p
              className={`text-lg font-extrabold leading-tight ${isSale ? "text-rose-600 dark:text-rose-400" : "text-indigo-600 dark:text-indigo-400"}`}
            >
              {formattedPrice}
            </p>
          </div>

          {/* Consultation */}
          <a
            href={zaloGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <MessageCircle className="h-4 w-4 text-blue-500" />
            Tư vấn
          </a>

          {/* Buy now */}
          <button
            onClick={() => setOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800"
          >
            Mua ngay
          </button>
        </div>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Hướng Dẫn Giao Dịch</DrawerTitle>
          </DrawerHeader>

          <div className="overflow-y-auto px-5 py-4">
            {/* Safe transaction guide */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div className="flex items-center gap-2 mb-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Giao dịch an toàn qua Shop
                </h3>
              </div>
              <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-600 marker:text-emerald-500 marker:font-semibold dark:text-slate-400">
                <li>Thỏa thuận giá với người bán</li>
                <li>Yêu cầu người bán tạo <span className="font-semibold text-slate-900 dark:text-slate-100">Box giao dịch có Chủ Shop</span></li>
                <li>Chủ Shop giữ tiền & xác nhận acc trước khi chuyển</li>
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
                Chủ shop <span className="font-bold">không chịu trách nhiệm</span> nếu giao dịch không thông qua chủ shop làm trung gian.
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
                {(seller.zaloLink || seller.facebookLink) && (
                  <div className="mt-2.5 flex gap-2">
                    {seller.zaloLink && (
                      <button onClick={() => setConfirmLink(seller.zaloLink!)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                        <Image src={zaloIcon} alt="Zalo" className="h-4 w-4 object-contain" />
                        Zalo Người Bán
                      </button>
                    )}
                    {seller.facebookLink && (
                      <button onClick={() => setConfirmLink(seller.facebookLink!)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                        <Image src={facebookIcon} alt="Facebook" className="h-4 w-4 object-contain" />
                        Facebook
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Confirm AlertDialog for seller contact */}
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
    </>
  );
}
