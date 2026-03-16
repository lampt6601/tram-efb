"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Eye,
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
import { ImageGallery } from "@/components/ui/ImageGallery";
import { StatusBadge } from "@/components/ui/Badge";
import { ApproveButton } from "./ApproveButton";
import { formatCurrency, formatNumber } from "@/lib/constants";
import type { AccountWithEmail } from "@/types/database";
import { AndroidCoinIcon, IosCoinIcon } from "@/components/ui/PlatformCoinIcons";

interface PendingAccountDrawerProps {
  account: AccountWithEmail;
  adminEmail: string;
  /** Controlled mode: if provided, the trigger button is hidden and the caller controls open state */
  controlledOpen?: boolean;
  onControlledClose?: () => void;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 px-3 py-3 text-center">
      <div className="mb-1">{icon}</div>
      <div className="text-base font-bold text-slate-900">{value}</div>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

export function PendingAccountDrawer({
  account,
  adminEmail,
  controlledOpen,
  onControlledClose,
}: PendingAccountDrawerProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const onClose = useCallback(() => {
    if (isControlled) {
      onControlledClose?.();
    } else {
      setInternalOpen(false);
    }
  }, [isControlled, onControlledClose]);

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
          100
      )
    : 0;

  const hasStats =
    (account.total_gp ?? 0) > 0 ||
    (account.total_coins_android ?? 0) > 0 ||
    (account.total_coins_ios ?? 0) > 0 ||
    (account.team_strength ?? 0) > 0;

  const drawer = open && mounted
    ? createPortal(
        <div className="fixed inset-0 z-[300] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <div className="relative ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-base font-semibold text-slate-900">
                    {account.title}
                  </h2>
                  <StatusBadge status={account.status} />
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  ID: {account.id.slice(0, 8)}…
                </p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Images */}
              {galleryImages.length > 0 ? (
                <div className="p-4">
                  <ImageGallery images={galleryImages} title={account.title} />
                </div>
              ) : (
                <div className="mx-4 mt-4 flex aspect-video items-center justify-center rounded-xl bg-slate-100">
                  <Gamepad2 className="h-16 w-16 text-slate-300" />
                </div>
              )}

              <div className="space-y-5 px-5 pb-6 pt-2">
                {/* Stats */}
                {hasStats && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
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
                                <span className="text-slate-400">·</span>
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
                        icon={
                          <MessageCircle className="h-4 w-4 text-indigo-500" />
                        }
                        label="Số lượng log"
                        value={account.monthly_log_quota ?? 10}
                      />
                    </div>
                  </div>
                )}

                {/* Price */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Giá
                  </p>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Giá nhập</span>
                      <span className="font-medium text-slate-700">
                        {formatCurrency(account.purchase_price)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-slate-500">Giá bán</span>
                      <div className="flex items-center gap-2">
                        {isSale && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatCurrency(account.original_price!)}
                          </span>
                        )}
                        <span
                          className={`text-lg font-bold ${isSale ? "text-rose-600" : "text-indigo-600"}`}
                        >
                          {formatCurrency(account.selling_price)}
                        </span>
                        {isSale && (
                          <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-600">
                            -{discount}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta info */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Thông Tin
                  </p>
                  <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    {account.server_region && (
                      <div className="flex items-center gap-2 text-sm">
                        <Server className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="text-slate-500">Server:</span>
                        <span className="font-medium text-slate-700">
                          {account.server_region}
                        </span>
                      </div>
                    )}
                    {account.emails?.email_address && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="text-slate-500">Email liên kết:</span>
                        <span className="truncate font-medium text-slate-700">
                          {account.emails.email_address}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="text-slate-500">Admin:</span>
                      <span className="truncate font-medium text-slate-700">
                        {adminEmail}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="text-slate-500">Ngày tạo:</span>
                      <span className="font-medium text-slate-700">
                        {fmtDate(account.created_at)}
                      </span>
                    </div>
                    {account.is_clone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          Clone Account
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with approve button */}
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
              <ApproveButton
                accountId={account.id}
                accountTitle={account.title}
                onApproved={onClose}
                fullWidth
              />
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {!isControlled && (
        <button
          onClick={() => setInternalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          Chi tiết
        </button>
      )}
      {drawer}
    </>
  );
}
