"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  MessageCircle,
  User,
  ExternalLink,
} from "lucide-react";
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
}

function TransactionPopup({
  open,
  onClose,
  contactMessage,
  ownerZaloUrl,
  ownerFacebookUrl,
  seller,
  zaloGroupUrl,
}: {
  open: boolean;
  onClose: () => void;
  contactMessage: string;
  ownerZaloUrl: string;
  ownerFacebookUrl: string;
  seller?: SellerInfo;
  zaloGroupUrl: string;
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Hướng Dẫn Giao Dịch
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {/* Option 1: Via shop owner (free) */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Trung gian qua Chủ Shop
              </h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                MIỄN PHÍ
              </span>
            </div>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600 marker:text-emerald-500 marker:font-semibold dark:text-slate-400">
              <li>Liên hệ người bán</li>
              <li>Sau khi chốt mua, yêu cầu người bán tạo Box giao dịch có chủ shop</li>
              <li>Giao dịch an toàn qua Box với chủ shop làm trung gian</li>
            </ol>
          </div>

          {/* Option 2: Via external middleman */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Trung gian qua bên thứ 3
              </h3>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                CÓ PHÍ
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sử dụng admin lớn của các group game làm trung gian. Phí do bên
              trung gian quy định. Tự thống nhất với bên bán về việc chọn trung
              gian.
            </p>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-slate-100 dark:border-slate-700" />

          {/* Contact section */}
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Liên hệ giao dịch
          </p>

          {/* Shop owner */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <Image
                src="/avatar-owner.jpeg"
                alt="Chủ shop"
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl object-cover shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Chủ Shop · Trung Gian
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Trần Hữu Cảnh
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex gap-2">
              <a
                href={`${ownerZaloUrl}?type=zalo&text=${contactMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Image
                  src={zaloIcon}
                  alt="Zalo"
                  className="h-4 w-4 object-contain"
                />
                Zalo Chủ Shop
              </a>
              <a
                href={ownerFacebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <Image
                  src={facebookIcon}
                  alt="Facebook"
                  className="h-4 w-4 object-contain"
                />
                Facebook
              </a>
            </div>
          </div>

          {/* Seller (if different) */}
          {seller && (
            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/30 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/5">
              <div className="flex items-center gap-3">
                {seller.avatarUrl ? (
                  <Image
                    src={seller.avatarUrl}
                    alt={seller.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 shadow-sm dark:bg-indigo-500/20">
                    <User className="h-5 w-5 text-indigo-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Người bán
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {seller.name}
                    {(seller.soldCount ?? 0) > 0 && (
                      <span className="ml-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        · {seller.soldCount} acc đã bán
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {(seller.zaloLink || seller.facebookLink) && (
                <div className="mt-2.5 flex gap-2">
                  {seller.zaloLink && (
                    <a
                      href={seller.zaloLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      <Image
                        src={zaloIcon}
                        alt="Zalo"
                        className="h-4 w-4 object-contain"
                      />
                      Zalo Người Bán
                    </a>
                  )}
                  {seller.facebookLink && (
                    <a
                      href={seller.facebookLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      <Image
                        src={facebookIcon}
                        alt="Facebook"
                        className="h-4 w-4 object-contain"
                      />
                      Facebook
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Consultation group */}
          <a
            href={zaloGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="flex items-center gap-2.5">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Nhóm Tư Vấn Zalo
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Hỏi đáp, tư vấn miễn phí
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-400" />
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function BuyNowBottomBar({
  formattedPrice,
  isSale,
  contactMessage,
  ownerZaloUrl,
  ownerFacebookUrl,
  seller,
  zaloGroupUrl,
}: BuyNowBottomBarProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const onClose = useCallback(() => setPopupOpen(false), []);

  return (
    <>
      {/* Sticky bottom bar — all screen sizes */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
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
            onClick={() => setPopupOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800"
          >
            Mua ngay
          </button>
        </div>
      </div>

      <TransactionPopup
        open={popupOpen}
        onClose={onClose}
        contactMessage={contactMessage}
        ownerZaloUrl={ownerZaloUrl}
        ownerFacebookUrl={ownerFacebookUrl}
        seller={seller}
        zaloGroupUrl={zaloGroupUrl}
      />
    </>
  );
}
