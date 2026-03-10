import Link from "next/link";
import Image from "next/image";
import {
  Gamepad2,
  Coins,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatNumber } from "@/lib/constants";
import type { PublicAccount } from "@/types/database";

export function AccountCard({ account }: { account: PublicAccount }) {
  const thumbnail = account.primary_image_url || account.images?.[0];
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
      className={`flex h-full w-full flex-col ${!isSold ? "rounded-2xl border border-slate-200 bg-white transition-colors duration-300 hover:border-indigo-200" : ""}`}
    >
      {/* Image + overlay/ribbon */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 aspect-video">
        {thumbnail ? (
          <Image
            src={thumbnail}
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

        {/* Gradient overlay + CTA for available accounts */}
        {!isSold && (
          <div className="absolute inset-x-0 bottom-0 flex translate-y-full flex-col items-center justify-end bg-gradient-to-t from-indigo-900/80 via-indigo-900/40 to-transparent pb-4 pt-10 transition-transform duration-300 group-hover:translate-y-0">
            <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-lg">
              Xem Chi Tiết <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3
          className={`truncate text-base font-semibold ${
            isSold
              ? "text-slate-700"
              : "text-slate-900 transition-colors duration-200 group-hover:text-indigo-600"
          }`}
        >
          {account.title}
        </h3>

        <div className="mt-1.5 min-h-[18px] sm:min-h-[20px]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {(account.total_gp ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1">
                <Zap
                  className={`h-3 w-3 ${
                    isSold ? "text-amber-400" : "text-amber-500"
                  }`}
                />
                <span>{formatNumber(account.total_gp)} GP</span>
              </span>
            )}
            {((account.total_coins_android ?? 0) > 0 ||
              (account.total_coins_ios ?? 0) > 0) && (
              <span className="inline-flex items-center gap-1">
                <Coins
                  className={`h-3 w-3 ${
                    isSold ? "text-yellow-400" : "text-yellow-500"
                  }`}
                />
                <span className="truncate">
                  {(account.total_coins_android ?? 0) > 0
                    ? `${formatNumber(account.total_coins_android)} 🤖`
                    : ""}
                  {(account.total_coins_android ?? 0) > 0 &&
                  (account.total_coins_ios ?? 0) > 0
                    ? " | "
                    : ""}
                  {(account.total_coins_ios ?? 0) > 0
                    ? `${formatNumber(account.total_coins_ios)} 🍎`
                    : ""}
                </span>
              </span>
            )}
            {(account.team_strength ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1">
                <Shield
                  className={`h-3 w-3 ${
                    isSold ? "text-blue-400" : "text-blue-500"
                  }`}
                />
                <span>{account.team_strength}</span>
              </span>
            )}
            {account.server_region && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                Server: {account.server_region}
              </span>
            )}
            {!isSold && account.monthly_log_quota != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                Số lượng log: {account.monthly_log_quota}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 flex items-end justify-between border-t border-slate-100 pt-2.5 sm:pt-3">
          <div className="flex flex-col">
            <div className="flex h-[18px] items-center">
              {!isSold && isSale && (
                <span className="text-xs font-medium text-slate-400 line-through decoration-slate-400 block h-full">
                  {formatCurrency(account.original_price!)}
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
              {formatCurrency(account.selling_price)}
            </span>
          </div>
          <div className="shrink-0 mb-1">
            {isSold ? (
              <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
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
      <div className="group block w-full overflow-hidden rounded-2xl border border-slate-200 bg-white opacity-80 shadow-sm transition-all duration-300 hover:opacity-100 hover:shadow-md">
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/accounts/${account.id}`}
      className="group block w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-100/60"
    >
      {cardContent}
    </Link>
  );
}
