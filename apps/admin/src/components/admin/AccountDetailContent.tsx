import {
  Zap,
  Coins,
  Shield,
  MessageCircle,
  Mail,
  User,
  Calendar,
  Gamepad2,
  Tag,
  Server,
} from "lucide-react";
import { ImageGallery } from "@thc-efb/ui/image-gallery";
import { formatCurrency, formatNumber, formatDateTimeVN } from "@thc-efb/shared/constants";
import type { AccountWithEmail } from "@thc-efb/supabase/types";
import { AndroidCoinIcon, IosCoinIcon } from "@thc-efb/ui/platform-coin-icons";
import { StatBox } from "./StatBox";

interface AccountDetailContentProps {
  account: AccountWithEmail;
  adminName: string;
}

export function AccountDetailContent({ account, adminName }: AccountDetailContentProps) {
  const galleryImages = account.primary_image_url
    ? [
        account.primary_image_url,
        ...(account.images?.filter((img) => img !== account.primary_image_url) ?? []),
      ]
    : account.images ?? [];

  const isSale =
    account.original_price != null &&
    account.original_price > account.selling_price;
  const discount = isSale
    ? Math.round(
        ((account.original_price! - account.selling_price) /
          account.original_price!) *
          100,
      )
    : 0;

  const hasStats =
    (account.total_gp ?? 0) > 0 ||
    (account.total_coins_android ?? 0) > 0 ||
    (account.total_coins_ios ?? 0) > 0 ||
    (account.team_strength ?? 0) > 0;

  return (
    <>
      {/* Images */}
      {galleryImages.length > 0 ? (
        <div className="px-4">
          <ImageGallery images={galleryImages} title={account.title} disableFullscreen />
        </div>
      ) : (
        <div className="mx-4 flex aspect-video items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
          <Gamepad2 className="h-16 w-16 text-slate-300 dark:text-slate-500" />
        </div>
      )}

      <div className="space-y-5 px-5 pb-6 pt-3">
        {/* Stats */}
        {hasStats && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Thông Số
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(account.total_gp ?? 0) > 0 && (
                <StatBox
                  icon={<Zap className="h-4 w-4 text-amber-500" />}
                  label="Tổng GP"
                  value={formatNumber(account.total_gp)}
                />
              )}
              {((account.total_coins_android ?? 0) > 0 ||
                (account.total_coins_ios ?? 0) > 0) && (
                <StatBox
                  icon={<Coins className="h-4 w-4 text-yellow-500" />}
                  label="Coins"
                  value={
                    <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
                      {(account.total_coins_android ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-0.5">
                          <AndroidCoinIcon size={18} />
                          {formatNumber(account.total_coins_android)}
                        </span>
                      )}
                      {(account.total_coins_android ?? 0) > 0 &&
                        (account.total_coins_ios ?? 0) > 0 && (
                        <span className="text-slate-400 dark:text-slate-500">·</span>
                      )}
                      {(account.total_coins_ios ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-0.5">
                          <IosCoinIcon size={18} />
                          {formatNumber(account.total_coins_ios)}
                        </span>
                      )}
                    </span>
                  }
                />
              )}
              {(account.team_strength ?? 0) > 0 && (
                <StatBox
                  icon={<Shield className="h-4 w-4 text-blue-500" />}
                  label="Lực Chiến"
                  value={account.team_strength!}
                />
              )}
              <StatBox
                icon={<MessageCircle className="h-4 w-4 text-indigo-500" />}
                label="Số lượng log"
                value={account.monthly_log_quota ?? 10}
              />
            </div>
          </div>
        )}

        {/* Price */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Giá
          </p>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Giá nhập</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {formatCurrency(account.purchase_price)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Giá bán</span>
              <div className="flex items-center gap-2">
                {isSale && (
                  <span className="text-xs text-slate-400 line-through dark:text-slate-500">
                    {formatCurrency(account.original_price!)}
                  </span>
                )}
                <span className={`text-lg font-bold ${isSale ? "text-rose-600" : "text-indigo-600"}`}>
                  {formatCurrency(account.selling_price)}
                </span>
                {isSale && (
                  <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Thông Tin
          </p>
          <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800">
            {account.server_region && (
              <div className="flex items-center gap-2 text-sm">
                <Server className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                <span className="text-slate-500 dark:text-slate-400">Server:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {account.server_region}
                </span>
              </div>
            )}
            {account.emails?.email_address && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                <span className="text-slate-500 dark:text-slate-400">Email:</span>
                <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                  {account.emails.email_address}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="text-slate-500 dark:text-slate-400">Admin:</span>
              <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                {adminName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="text-slate-500 dark:text-slate-400">Ngày tạo:</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {formatDateTimeVN(account.created_at)}
              </span>
            </div>
            {account.is_clone && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                  Clone Account
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
