import Link from "next/link";
import Image from "next/image";
import {
  Gamepad2,
  ArrowRight,
  CheckCircle2,
  Star,
  Copy,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/ui/Badge";

import { formatCompactCurrency } from "@/lib/constants";
import type { PublicAccount } from "@/types/database";
import { thumbCard } from "@/lib/image-utils";

export function AccountCard({ account }: { account: PublicAccount }) {
  const thumbnail = account.primary_image_url || account.images?.[0];
  const optimizedThumb = thumbnail ? thumbCard(thumbnail) : undefined;
  const isSold = account.status === "Sold";
  const isSale = account.original_price
    ? account.original_price > account.selling_price
    : false;
  const discount = isSale
    ? Math.round(
        ((account.original_price! - account.selling_price) /
          account.original_price!) *
          100,
      )
    : 0;

  const cardContent = (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded-2xl ${!isSold ? "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 transition-colors duration-300 group-hover:border-indigo-300 dark:group-hover:border-indigo-500" : "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"}`}
    >
      {/* Image + overlay/ribbon */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 aspect-video">
        {optimizedThumb ? (
          <Image
            src={optimizedThumb}
            alt={account.title}
            fill
            sizes="(min-width: 1280px) 380px, (min-width: 768px) 50vw, 100vw"
            className={`h-full w-full object-cover ${
              isSold
                ? "grayscale-[30%]"
                : "transition-transform duration-500 group-hover:scale-110 group-hover:brightness-90"
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Gamepad2
              className={`h-16 w-16 text-slate-300 ${!isSold ? "transition-transform duration-300 group-hover:scale-110" : ""}`}
            />
          </div>
        )}

        {/* Sold ribbon */}
        {isSold && (
          <div className="absolute left-0 top-3 flex items-center gap-1.5 rounded-r-full bg-emerald-500 py-1 pl-3 pr-4 shadow-md z-10">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">
              Đã Bán
            </span>
          </div>
        )}

        {/* Sale ribbon */}
        {!isSold && isSale && (
          <div className="absolute left-0 top-3 flex items-center gap-1 rounded-r-full bg-rose-500 py-1 pl-3 pr-4 shadow-md z-10">
            <span className="text-[12px] font-bold uppercase tracking-wider text-white">
              -{discount}% GIẢM
            </span>
          </div>
        )}

        {/* Priority ribbon */}
        {!isSold && account.is_priority && (
          <div className="absolute right-0 top-3 flex items-center gap-1.5 rounded-l-full bg-amber-500 py-1 pl-4 pr-3 shadow-md z-10">
            <Star className="h-3.5 w-3.5 fill-white text-white" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">
              Nổi Bật
            </span>
          </div>
        )}

        {/* Clone ribbon */}
        {!isSold && account.is_clone && !account.is_priority && (
          <div className="absolute right-0 top-3 flex items-center gap-1.5 rounded-l-full bg-violet-500 py-1 pl-4 pr-3 shadow-md z-10">
            <Copy className="h-3.5 w-3.5 text-white" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">
              Clone
            </span>
          </div>
        )}

        {/* Gradient overlay + CTA for available accounts */}
        {!isSold && (
          <div className="absolute inset-x-0 bottom-0 flex translate-y-full flex-col items-center justify-end bg-gradient-to-t from-indigo-950/85 via-indigo-900/50 to-transparent pb-4 pt-12 transition-transform duration-300 ease-out group-hover:translate-y-0">
            <span className="flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg ring-1 ring-indigo-400/60 transition-colors duration-200 group-hover:bg-indigo-400">
              Xem Chi Tiết <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-h-[2.75rem] flex-1">
            <h3
            className={`text-base font-semibold line-clamp-2 ${
              isSold
                ? "text-slate-700 dark:text-slate-300"
                : "text-slate-900 dark:text-slate-100 transition-colors duration-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
            }`}
          >
            {account.title}
            </h3>
          </div>
        </div>

        <div className="mt-1.5 min-h-[1.5rem]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {account.server_region && (
              <Badge
                variant="secondary"
                className="h-auto rounded-full px-2 py-0.5 text-[11px] text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700"
              >
                Server: {account.server_region}
              </Badge>
            )}
            {!isSold && account.is_clone && (
              <Badge
                variant="outline"
                className="h-auto rounded-full px-2 py-0.5 text-[11px] text-violet-700 bg-violet-50 border-violet-200 dark:text-violet-300 dark:bg-violet-500/15 dark:border-violet-500/30"
              >
                Clone
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 flex items-end justify-between border-t border-slate-100 dark:border-slate-700 pt-2.5 sm:pt-3">
          <div className="flex flex-col">
            <div className="flex h-[18px] items-center">
              {!isSold && isSale && (
                <span className="text-xs font-medium text-slate-400 line-through decoration-slate-400 block h-full">
                  {formatCompactCurrency(account.original_price!)}
                </span>
              )}
            </div>
            <span
              className={`truncate pr-2 ${
                isSold
                  ? "text-base sm:text-lg font-bold text-slate-500 line-through decoration-slate-400"
                  : `text-lg sm:text-xl font-bold transition-colors duration-200 ${isSale ? "text-rose-600 group-hover:text-rose-700" : "text-indigo-600 group-hover:text-indigo-700"}`
              }`}
            >
              {formatCompactCurrency(account.selling_price)}
            </span>
          </div>
          <div className="shrink-0 mb-1">
            {isSold ? (
              <span className="rounded-lg bg-emerald-50 dark:bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Đã giao dịch
              </span>
            ) : (
              <StatusBadge status={account.status} />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isSold) {
    return (
      <Link
        href={`/accounts/${account.id}`}
        className="group flex h-full w-full rounded-2xl opacity-80 shadow-sm transition-all duration-300 hover:opacity-100 hover:shadow-md"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <Link
      href={`/accounts/${account.id}`}
      className="group flex h-full w-full rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-200/70 dark:hover:shadow-indigo-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
    >
      {cardContent}
    </Link>
  );
}
