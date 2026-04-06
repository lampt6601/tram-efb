"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle, Loader2, Eye, Clock, User, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approveAccount, rejectAccount } from "@/app/actions/super-admin-actions";
import type { PendingAccount } from "@/hooks/usePendingApprovals";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function formatPrice(price: number | null): string {
  if (!price) return "—";
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

interface PendingApprovalsPanelProps {
  accounts: PendingAccount[];
  loading: boolean;
  onClose: () => void;
  onViewAccount: (accountId: string) => void;
  onApproved: (accountId: string) => void;
  onRejected: (accountId: string) => void;
}

export function PendingApprovalsPanel({
  accounts,
  loading,
  onClose,
  onViewAccount,
  onApproved,
  onRejected,
}: PendingApprovalsPanelProps) {
  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900 sm:w-96">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Chờ Duyệt
          </h3>
          {accounts.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-[11px] font-bold text-red-600 dark:bg-red-500/20 dark:text-red-400">
              {accounts.length}
            </span>
          )}
        </div>
        {loading && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
        )}
      </div>

      {/* List */}
      <div className="max-h-[28rem] overflow-y-auto overscroll-contain">
        {accounts.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Không có tài khoản chờ duyệt
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Tất cả đã được xử lý
            </p>
          </div>
        ) : (
          accounts.map((account) => (
            <PendingAccountRow
              key={account.id}
              account={account}
              onView={() => {
                onClose();
                onViewAccount(account.id);
              }}
              onApproved={() => onApproved(account.id)}
              onRejected={() => onRejected(account.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ────────── Single row ────────── */

function PendingAccountRow({
  account,
  onView,
  onApproved,
  onRejected,
}: {
  account: PendingAccount;
  onView: () => void;
  onApproved: () => void;
  onRejected: () => void;
}) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setApproving(true);
    try {
      await approveAccount(account.id);
      toast.success(`Đã duyệt "${account.title}"`);
      onApproved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setApproving(false);
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRejecting(true);
    try {
      await rejectAccount(account.id);
      toast.success(`Đã từ chối "${account.title}"`);
      onRejected();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setRejecting(false);
    }
  };

  return (
    <div className="flex items-start gap-3 border-b border-slate-50 px-4 py-3 last:border-0 dark:border-white/5">
      {/* Thumbnail */}
      <button
        onClick={onView}
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
      >
        {account.primary_image_url ? (
          <Image
            src={account.primary_image_url}
            alt={account.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <Eye className="h-4 w-4" />
          </div>
        )}
      </button>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <button
          onClick={onView}
          className="block w-full text-left"
        >
          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
            {account.title}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {formatPrice(account.selling_price)}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {account.admin_name}
            </span>
          </div>
          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <Clock className="h-3 w-3" />
            {timeAgo(account.created_at)}
          </span>
        </button>
      </div>

      {/* Action buttons */}
      <div className="mt-1 flex shrink-0 items-center gap-1">
        <button
          onClick={handleReject}
          disabled={rejecting || approving}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
          title="Từ chối"
        >
          {rejecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={handleApprove}
          disabled={approving || rejecting}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
          title="Duyệt"
        >
          {approving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
