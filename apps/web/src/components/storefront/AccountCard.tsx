import Link from "next/link";
import Image from "next/image";
import {
  Gamepad2,
  ArrowRight,
  ShoppingBag,
  User,
} from "lucide-react";
import { StatusBadge } from '@thc-efb/ui/badge';

import { formatCompactCurrency } from '@thc-efb/shared/constants';
import type { PublicAccount } from '@thc-efb/supabase/types';
import { thumbCard } from '@thc-efb/shared/image-utils';

export function AccountCard({ account, priority = false }: { account: PublicAccount; priority?: boolean }) {
  const thumbnail = account.primary_image_url || account.images?.[0];
  const optimizedThumb = thumbnail ? thumbCard(thumbnail) : undefined;
  const isSold = account.status === "Sold";
  const isDeposited = account.status === "Deposited";
  const isUnavailable = isSold || isDeposited;
  const isSale = !isUnavailable && account.original_price
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
      className={[
        "flex h-full w-full flex-col overflow-hidden rounded-xl transition-colors duration-200",
        account.is_priority && !isUnavailable
          ? "ring-2 ring-amber-400/80 dark:ring-amber-500/60 bg-white dark:bg-slate-800"
          : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80",
        !isUnavailable && "group-hover:border-indigo-300 dark:group-hover:border-indigo-500/60",
      ].filter(Boolean).join(" ")}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-700 aspect-[16/9]">
        {optimizedThumb ? (
          <Image
            src={optimizedThumb}
            alt={account.title}
            fill
            sizes="(min-width: 1280px) 380px, (min-width: 768px) 50vw, 100vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className={[
              "h-full w-full object-cover",
              isSold && "grayscale-[40%] brightness-75",
              isDeposited && "brightness-[0.6]",
              !isUnavailable && "transition-transform duration-500 group-hover:scale-105",
            ].filter(Boolean).join(" ")}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Gamepad2
              className={`h-14 w-14 text-slate-300 dark:text-slate-500 ${!isUnavailable ? "transition-transform duration-300 group-hover:scale-110" : ""}`}
            />
          </div>
        )}

        {/* Sold / Deposited overlay label */}
        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={[
                "rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm",
                isSold ? "bg-emerald-600/80" : "bg-blue-600/80",
              ].join(" ")}
            >
              {isSold ? "Đã Bán" : "Đang Cọc"}
            </span>
          </div>
        )}

        {/* Sale discount pill — top-left */}
        {isSale && discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}

        {/* Priority star — top-right, only when no overlay */}
        {!isUnavailable && account.is_priority && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">
            ★ Nổi Bật
          </span>
        )}

        {/* Hover CTA */}
        {!isUnavailable && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent pb-3 pt-10 transition-transform duration-300 group-hover:translate-y-0">
            <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-xs font-semibold text-slate-900 shadow backdrop-blur-sm">
              Xem Chi Tiết <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Title */}
        <h3
          className={[
            "text-[13px] sm:text-sm font-semibold leading-snug line-clamp-2",
            isUnavailable
              ? "text-slate-500 dark:text-slate-400"
              : "text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200",
          ].join(" ")}
        >
          {account.title}
        </h3>

        {/* Spacer pushes price+seller to bottom */}
        <div className="mt-auto" />

        {/* Price row */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            {isSale && (
              <span className="text-[11px] font-medium text-slate-400 line-through">
                {formatCompactCurrency(account.original_price!)}
              </span>
            )}
            <span
              className={[
                "text-base sm:text-lg font-bold tracking-tight",
                isSold
                  ? "text-slate-400 line-through"
                  : isSale
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-900 dark:text-white",
              ].join(" ")}
            >
              {formatCompactCurrency(account.selling_price)}
            </span>
          </div>

          {!isUnavailable && (
            <StatusBadge status={account.status} />
          )}
        </div>

        {/* Seller row */}
        {account.seller_full_name && (
          <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-700/60 pt-2">
            {account.seller_avatar_url ? (
              <span className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-slate-600">
                <Image
                  src={account.seller_avatar_url}
                  alt={account.seller_full_name}
                  fill
                  className="object-cover"
                />
              </span>
            ) : (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <User className="h-2.5 w-2.5 text-slate-400" />
              </span>
            )}
            <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {account.seller_full_name}
            </span>
            {account.seller_sold_count != null && account.seller_sold_count > 0 && (
              <span className="ml-auto flex shrink-0 items-center gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                <ShoppingBag className="h-3 w-3" />
                {account.seller_sold_count}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isUnavailable) {
    return (
      <Link
        href={`/accounts/${account.id}`}
        className="group flex h-full w-full rounded-xl opacity-75 transition-all duration-200 hover:opacity-100 hover:shadow-md"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <Link
      href={`/accounts/${account.id}`}
      className="group flex h-full w-full rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
    >
      {cardContent}
    </Link>
  );
}
