"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import zaloIcon from "@/assets/icons/zalo.png";
import facebookIcon from "@/assets/icons/facebook.webp";

interface SellerShopContactProps {
  zaloUrl?: string;
  facebookUrl?: string;
}

export function SellerShopContact({
  zaloUrl,
  facebookUrl,
}: SellerShopContactProps) {
  const [confirmLink, setConfirmLink] = useState<string | null>(null);

  if (!zaloUrl && !facebookUrl) return null;

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        {zaloUrl && (
          <button
            onClick={() => setConfirmLink(zaloUrl)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <Image src={zaloIcon} alt="Zalo" className="h-3.5 w-3.5 object-contain" />
            Zalo
          </button>
        )}
        {facebookUrl && (
          <button
            onClick={() => setConfirmLink(facebookUrl)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <Image src={facebookIcon} alt="Facebook" className="h-3.5 w-3.5 object-contain" />
            Facebook
          </button>
        )}
      </div>

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
